#!/usr/bin/env node
// Local, append-only importer. No packages or changes to browser code required.
import { readFile, writeFile, mkdir, mkdtemp, realpath, rename, unlink, open } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateEvent, validateRelationship } from '../js/validation.js';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const collections = ['events', 'persons', 'institutions', 'relationships', 'sources'];
const names = [...collections, 'vocabularies'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const id = { type: 'string', pattern: '^[A-Za-z0-9_-]+$' };
const text = { type: 'string' };
const title = { type: 'string', minLength: 1 };
const year = { type: 'number' };
const nullableYear = { type: ['number', 'null'] };
const recordSchema = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const supportingSchemas = {
  persons: recordSchema({ id, name: title, birth_year: year, death_year: nullableYear, short_description: text }),
  institutions: recordSchema({ id, name: title, founded_year: year, dissolved_year: nullableYear, place: text, short_description: text }),
  sources: recordSchema({ id, title, author: text, year: nullableYear, source_type: text, publisher: text, url: { type: ['string', 'null'] }, notes: text }),
};

// Only the keywords used by the two existing schemas and the small shapes above.
function checkShape(value, schema, path, errors) {
  const types = [].concat(schema.type);
  const matches = type => type === 'null' ? value === null : type === 'array' ? Array.isArray(value)
    : type === 'object' ? object(value) : type === 'integer' ? Number.isInteger(value)
      : type === 'number' ? Number.isFinite(value) : typeof value === type;
  if (!types.some(matches)) { errors.push(`${path}: expected ${types.join(' or ')}.`); return; }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: unknown vocabulary value ${JSON.stringify(value)}.`);
  if (typeof value === 'string') {
    if (schema.minLength && value.trim().length < schema.minLength) errors.push(`${path}: must not be blank.`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: invalid ID.`);
  }
  if (typeof value === 'number' && (value < schema.minimum || value > schema.maximum)) errors.push(`${path}: outside allowed range.`);
  if (Array.isArray(value)) {
    if (schema.uniqueItems && new Set(value.map(item => JSON.stringify(item))).size !== value.length) errors.push(`${path}: repeated array values.`);
    value.forEach((item, i) => checkShape(item, schema.items, `${path}[${i}]`, errors));
  }
  if (object(value)) {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) errors.push(`${path}.${key}: required field missing.`);
    for (const [key, item] of Object.entries(value)) {
      if (schema.properties[key]) checkShape(item, schema.properties[key], `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}.${key}: unknown field.`);
    }
  }
}

async function inside(root, path) {
  const actual = await realpath(path);
  const rel = relative(root, actual);
  if (rel === '..' || rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) || isAbsolute(rel)) throw new Error(`Path must stay inside the project: ${path}`);
  return actual;
}

export async function preview(root, input) {
  root = await realpath(root);
  const incoming = JSON.parse(await readFile(await inside(root, resolve(root, input)), 'utf8'));
  if (!object(incoming)) throw new Error('Import must be an object containing collection arrays.');
  const errors = [];
  for (const key of Object.keys(incoming)) if (!collections.includes(key)) errors.push(`Unknown import collection: ${key}.`);
  for (const name of collections) if (Object.hasOwn(incoming, name) && !Array.isArray(incoming[name])) errors.push(`${name}: expected an array.`);
  if (errors.length) return { errors, counts: {} };
  const originals = {}, data = {}, paths = {};
  for (const name of names) {
    paths[name] = await inside(root, join(root, 'data', `${name}.json`));
    originals[name] = await readFile(paths[name], 'utf8');
    data[name] = JSON.parse(originals[name]);
    if (name !== 'vocabularies' && !Array.isArray(data[name])) throw new Error(`${name}.json must contain an array.`);
  }
  const counts = Object.fromEntries(collections.map(name => [name, incoming[name]?.length ?? 0]));
  for (const name of collections) data[name] = [...data[name], ...(incoming[name] ?? [])];
  const schemas = { ...supportingSchemas };
  for (const [name, filename] of [['events', 'event'], ['relationships', 'relationship']]) {
    schemas[name] = JSON.parse(await readFile(await inside(root, join(root, 'data', `${filename}.schema.json`)), 'utf8'));
  }
  const vocab = data.vocabularies;
  const vocabularyNames = ['disciplines', 'entry_types', 'relationship_types', 'topics', 'subdisciplines', 'date_precisions', 'scopes', 'confidence', 'source_types'];
  for (const name of vocabularyNames) {
    if (!object(vocab) || !Array.isArray(vocab[name]) || vocab[name].some(item => !object(item) || typeof item.id !== 'string')) errors.push(`vocabularies.${name}: invalid vocabulary.`);
    else if (new Set(vocab[name].map(item => item.id)).size !== vocab[name].length) errors.push(`vocabularies.${name}: duplicate IDs.`);
  }
  if (errors.length) return { errors, counts };
  // Vocabulary file is authoritative; do not freeze its current IDs in schemas.
  for (const [field, list] of [['entry_type', 'entry_types'], ['primary_discipline', 'disciplines'], ['date_precision', 'date_precisions'], ['scope', 'scopes'], ['confidence', 'confidence']]) schemas.events.properties[field].enum = vocab[list].map(item => item.id);
  for (const [field, list] of [['secondary_disciplines', 'disciplines'], ['topics', 'topics'], ['subdisciplines', 'subdisciplines']]) schemas.events.properties[field].items.enum = vocab[list].map(item => item.id);
  schemas.relationships.properties.relationship_type.enum = vocab.relationship_types.map(item => item.id);
  for (const name of collections) {
    const ids = new Set();
    data[name].forEach((record, index) => {
      const path = `${name}[${index}]${object(record) ? ` (${record.id ?? '?'})` : ''}`;
      checkShape(record, schemas[name], path, errors);
      if (object(record)) {
        if (ids.has(record.id)) errors.push(`${path}: duplicate ID; existing records are never overwritten.`);
        ids.add(record.id);
      }
    });
  }
  // Do not feed malformed structures to the browser's semantic validators.
  if (errors.length) return { errors, counts };
  for (const event of data.events) errors.push(...validateEvent(event, [], vocab, data).map(error => `events (${event.id}): ${error}`));
  const accepted = [];
  for (const relationship of data.relationships) {
    errors.push(...validateRelationship(relationship, accepted, data.events, vocab, data.sources).map(error => `relationships (${relationship.id}): ${error}`));
    accepted.push(relationship);
  }
  for (const [name, start, end] of [['persons', 'birth_year', 'death_year'], ['institutions', 'founded_year', 'dissolved_year']]) {
    for (const record of data[name]) if (record[end] !== null && record[end] < record[start]) errors.push(`${name} (${record.id}): end year precedes start year.`);
  }
  for (const source of data.sources) {
    if (!vocab.source_types.some(item => item.id === source.source_type)) errors.push(`sources (${source.id}): unknown source_type.`);
    if (source.url !== null) {
      try { if (!['http:', 'https:'].includes(new URL(source.url).protocol)) throw new Error(); }
      catch { errors.push(`sources (${source.id}): URL must be HTTP(S) or null.`); }
    }
  }
  return { errors, counts, data, originals, paths };
}

export async function applyImport(root, input, replace = rename) {
  root = await realpath(root);
  const lockPath = join(root, '.import-data.lock');
  const lock = await open(lockPath, 'wx').catch(error => { throw new Error(`Cannot acquire import lock (${error.code}). Another import may be running; see DATA_MODEL.md.`); });
  let backup;
  const written = [];
  let plan;
  try {
    plan = await preview(root, input);
    if (plan.errors.length || !Object.values(plan.counts).some(Boolean)) return plan;
    const backupParent = join(root, 'backups');
    await mkdir(backupParent, { recursive: true });
    await inside(root, backupParent);
    backup = await mkdtemp(join(backupParent, 'import-'));
    for (const name of names) {
      const path = join(backup, `${name}.json`);
      await writeFile(path, plan.originals[name], { flag: 'wx' });
      if (await readFile(path, 'utf8') !== plan.originals[name]) throw new Error(`Backup verification failed: ${name}.`);
    }
    const changed = collections.filter(name => plan.counts[name]);
    for (const name of changed) await writeFile(join(backup, `${name}.pending`), JSON.stringify(plan.data[name], null, 2) + '\n', { flag: 'wx' });
    for (const name of names) if (await readFile(plan.paths[name], 'utf8') !== plan.originals[name]) throw new Error('Data changed during preparation. Run preview again.');
    console.log(`Verified backup: ${relative(root, backup)}`);
    for (const name of changed) {
      await replace(join(backup, `${name}.pending`), plan.paths[name]);
      written.push(name);
    }
    return { ...plan, backup };
  } catch (error) {
    const recoveryErrors = [];
    for (const name of written.reverse()) {
      try {
        const temporary = join(backup, `${name}.restore`);
        await writeFile(temporary, plan.originals[name], { flag: 'wx' });
        await rename(temporary, plan.paths[name]);
      } catch (restoreError) { recoveryErrors.push(`${name}: ${restoreError.message}`); }
    }
    throw new Error(`${error.message}${backup ? ` Backup retained at ${backup}.` : ''}${recoveryErrors.length ? ` RESTORE REQUIRED: ${recoveryErrors.join('; ')}` : written.length ? ' Original data restored.' : ''}`);
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}

async function main() {
  const [mode, input, ...extra] = process.argv.slice(2);
  if (!['preview', 'apply'].includes(mode) || !input || extra.length) throw new Error('Usage: node scripts/import-data.mjs preview|apply imports/file.json');
  const result = mode === 'apply' ? await applyImport(project, input) : await preview(project, input);
  for (const [name, count] of Object.entries(result.counts)) console.log(`${name}: ${count} proposed addition(s)`);
  if (result.errors.length) {
    console.error(`Import rejected. No data changed.\n${result.errors.map(error => `- ${error}`).join('\n')}`);
    process.exitCode = 1;
  } else console.log(mode === 'preview' ? 'Validation passed. No files changed. Use apply to add these records.' : result.backup ? 'Import applied. Reload the website.' : 'Nothing to add. No data changed.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
