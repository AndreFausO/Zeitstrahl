import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm, readdir, rename, symlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { collections, preview, applyImport } from '../scripts/import-data.mjs';

// All test writes stay in a disposable folder inside this project.
const project = fileURLToPath(new URL('../', import.meta.url));
const root = await mkdtemp(join(project, '.import-test-'));
const names = [...collections, 'vocabularies'];
const fixture = JSON.parse(await readFile(new URL('../imports/example.json', import.meta.url), 'utf8'));
const original = {};
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`✓ ${name}`); };
async function setup(value = fixture) {
  await rm(join(root, 'backups'), { recursive: true, force: true });
  await mkdir(join(root, 'data'), { recursive: true });
  for (const name of [...names, 'event.schema', 'relationship.schema']) await copyFile(join(project, 'data', `${name}.json`), join(root, 'data', `${name}.json`));
  for (const name of names) original[name] = await readFile(join(root, 'data', `${name}.json`), 'utf8');
  await writeFile(join(root, 'input.json'), JSON.stringify(value));
}
async function unchanged() {
  for (const name of names) assert.equal(await readFile(join(root, 'data', `${name}.json`), 'utf8'), original[name]);
}
async function rejected(value) {
  await setup(value);
  const result = await applyImport(root, 'input.json');
  assert.ok(result.errors.length);
  await unchanged();
  assert.ok(!(await readdir(root)).includes('backups'));
}
try {
  await test('Preview resolves references within the batch and writes nothing', async () => {
    await setup();
    const before = await readdir(root);
    const result = await preview(root, 'input.json');
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.counts, Object.fromEntries(collections.map(name => [name, 1])));
    await unchanged();
    assert.deepEqual(await readdir(root), before);
  });
  await test('Apply appends all five collections and verifies all six backup files', async () => {
    const result = await applyImport(root, 'input.json');
    assert.deepEqual(result.errors, []);
    for (const name of names) {
      assert.equal(await readFile(join(result.backup, `${name}.json`), 'utf8'), original[name]);
      const current = JSON.parse(await readFile(join(root, 'data', `${name}.json`), 'utf8'));
      assert.deepEqual(current, name === 'vocabularies' ? JSON.parse(original[name]) : [...JSON.parse(original[name]), ...fixture[name]]);
    }
    const before = await Promise.all(names.map(name => readFile(join(root, 'data', `${name}.json`), 'utf8')));
    assert.ok((await applyImport(root, 'input.json')).errors.some(error => error.includes('duplicate ID')));
    assert.deepEqual(await Promise.all(names.map(name => readFile(join(root, 'data', `${name}.json`), 'utf8'))), before);
  });
  await test('Duplicate IDs within a batch reject every addition', async () => {
    const bad = structuredClone(fixture); bad.persons.push(bad.persons[0]); await rejected(bad);
  });
  await test('Existing IDs never overwrite records', async () => {
    const bad = structuredClone(fixture); bad.events[0].id = 'E0001'; await rejected(bad);
  });
  await test('Missing references and invalid vocabularies reject the whole import', async () => {
    for (const changes of [{ persons: ['missing'] }, { source_ids: ['missing'] }, { topics: ['missing'] }, { primary_discipline: 'missing' }]) {
      const bad = structuredClone(fixture); Object.assign(bad.events[0], changes); await rejected(bad);
    }
  });
  await test('Malformed records, missing fields and wrong collection names reject safely', async () => {
    for (const value of [{ people: [] }, { events: null }, { persons: [null] }, { events: [{}] }, { sources: [{ ...fixture.sources[0], url: 'javascript:alert(1)' }] }]) await rejected(value);
    const bad = structuredClone(fixture); delete bad.events[0].notes; await rejected(bad);
  });
  await test('Invalid dates and relationship pairs are rejected', async () => {
    const bad = structuredClone(fixture); bad.persons[0].death_year = 1700; await rejected(bad);
    const duplicate = structuredClone(fixture); duplicate.relationships.push({ ...duplicate.relationships[0], id: 'R0062' }); await rejected(duplicate);
    const self = structuredClone(fixture); self.relationships[0].target_id = 'E0045'; await rejected(self);
  });
  await test('Omitted collections are allowed; untouched files retain their exact bytes', async () => {
    await setup({ persons: fixture.persons });
    const result = await applyImport(root, 'input.json'); assert.deepEqual(result.errors, []);
    for (const name of names.filter(name => name !== 'persons')) assert.equal(await readFile(join(root, 'data', `${name}.json`), 'utf8'), original[name]);
  });
  await test('Write failure rolls back files already replaced', async () => {
    await setup(); let writes = 0;
    await assert.rejects(applyImport(root, 'input.json', async (...args) => {
      if (++writes === 2) throw new Error('simulated disk failure');
      await rename(...args);
    }), /Original data restored/);
    await unchanged();
    assert.ok(!(await readdir(root)).includes('.import-data.lock'));
  });
  await test('Backup failure prevents changes', async () => {
    await setup(); await writeFile(join(root, 'backups'), 'blocked');
    await assert.rejects(applyImport(root, 'input.json')); await unchanged();
  });
  await test('A competing import lock prevents changes', async () => {
    await setup(); await writeFile(join(root, '.import-data.lock'), '');
    await assert.rejects(applyImport(root, 'input.json'), /lock/); await unchanged();
    await rm(join(root, '.import-data.lock'));
  });
  await test('Input symlinks escaping the selected project are rejected before reading', async () => {
    await setup(); await symlink(join(project, 'imports', 'example.json'), join(root, 'escape.json'));
    await assert.rejects(preview(root, 'escape.json'), /inside the project/); await unchanged();
  });
  await test('Invalid JSON and empty imports do not change content', async () => {
    await setup({}); assert.deepEqual((await applyImport(root, 'input.json')).errors, []); await unchanged();
    await writeFile(join(root, 'input.json'), '{broken'); await assert.rejects(applyImport(root, 'input.json')); await unchanged();
  });
  console.log(`\n${passed} import test groups passed.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
