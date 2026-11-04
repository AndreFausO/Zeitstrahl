import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildResearchPrompt, loadPromptReferences } from '../js/analysis-prompt.js';
import { analyze, priorities } from '../js/analysis-model.js';
import { analysisConfig } from '../js/analysis-config.js';
const names = ['events','relationships','persons','institutions','sources','vocabularies'];
const data = Object.fromEntries(await Promise.all(names.map(async name => [name, JSON.parse(await readFile(new URL(`../data/${name}.json`, import.meta.url), 'utf8'))])));
const references = Object.fromEntries(await Promise.all(['CONTENT_GUIDELINES.md','DATA_MODEL.md'].map(async name => [name, await readFile(new URL(`../${name}`, import.meta.url), 'utf8')])));
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
const prompt = buildResearchPrompt(data, { references });
const a = analyze(data);
test('Deterministisch, vollständig, unveränderliche Eingaben', () => {
  const before = JSON.stringify(data);
  assert.equal(buildResearchPrompt(data, { references }), prompt);
  assert.equal(JSON.stringify(data), before);
  for (const text of ['10–15','Peter Seixas','globale und multiperspektivische','wissenschaftliche Quellen','kein automatischer Import','kein Deployment','ohne Markdown-Codezaun oder zusätzliche Schemafelder']) assert.ok(prompt.includes(text), text);
  for (const text of Object.values(references)) assert.ok(prompt.includes(text));
  assert.ok(prompt.includes(JSON.stringify(data.vocabularies)));
  for (const key of ['persons','institutions','sources']) assert.ok(prompt.includes(JSON.stringify(data[key])));
});
test('Alle 6 / 22 / 21 Ziele und Toleranzen aus dem Analysemodell', () => {
  for (const key of ['disciplines','subdisciplines','topics']) for (const row of a[key]) {
    const section = prompt.split(`### ${{disciplines:'Hauptdisziplinen',subdisciplines:'Unterdisziplinen',topics:'Themen'}[key]}\n`)[1].split('\n##')[0];
    const output = section.split('\n').find(line => line.startsWith(`- ${row.label} [${row.id}]${row.discipline_id ? ` (Elternbereich ${row.discipline_id})` : ':'}`));
    assert.ok(output.includes(`Ziel ${row.target} %`), output);
    assert.ok(output.includes(row.tolerance == null ? 'kein Korridor' : `±${new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(row.tolerance)} Prozentpunkte`), output);
  }
  const original = analysisConfig.disciplines.science;
  try { analysisConfig.disciplines.science = 17; assert.match(buildResearchPrompt(data,{references}), /Wissenschaft \[science\].*Ziel 17 %/); }
  finally { analysisConfig.disciplines.science = original; }
});
test('Ohne Filter globale Prioritäten in Kompass-Reihenfolge', () => {
  assert.ok(prompt.includes('Keine Filter:'));
  for (const type of ['Quantitative Orientierung','Qualitativer Hinweis']) {
    const rows = priorities(a).filter(p => p.type === type);
    let last = -1;
    for (const p of rows) { const index = prompt.indexOf(`${p.area}: Anzahl`); assert.ok(index > last); last = index; }
  }
  for (const t of a.time) assert.ok(prompt.includes(`- ${t.label}: ${t.count}`));
  for (const g of a.geography) assert.ok(prompt.includes(`- ${JSON.stringify(g.label)}: ${g.count}`));
});
test('Kombinierte Filter: lokale Analyse, globale Ziele und vollständige Referenz', () => {
  const selection = {discipline:'science', topic:'knowledge', from:'1700', to:'1950'};
  const filtered = buildResearchPrompt(data, {references, selection});
  assert.ok(filtered.includes('Kombinierte Filter: discipline="science"; topic="knowledge"; from="1700"; to="1950"'));
  assert.ok(filtered.includes('Ist-Verteilungen der Rechercherichtung (ohne lokale Zielquoten)'));
  for (const e of data.events) assert.ok(filtered.includes(`${JSON.stringify(e.id)} | ${JSON.stringify(e.title)} | ${e.start_year}–${e.end_year ?? e.start_year}`));
  assert.ok(filtered.includes('Diese Liste ersetzt keinen vollständigen inhaltlichen Abgleich.'));
  const local = filtered.split('## Ist-Verteilungen der Rechercherichtung')[1].split('## Rechercheprioritäten')[0];
  assert.ok(!local.includes('; Ziel '));
});
test('Leere Auswahl, leerer Bestand, unbekannte Ziele und fehlende Referenzen', () => {
  assert.ok(buildResearchPrompt(data,{references,selection:{from:999999}}).includes('keine vorhandenen Treffer'));
  const empty = {...data, events:[], relationships:[]};
  const text = buildResearchPrompt(empty);
  assert.ok(text.includes('Gesamtbestand: 0 Ereignisse'));
  assert.ok(text.includes('CONTENT_GUIDELINES.md fehlt'));
  assert.ok(text.includes('DATA_MODEL.md fehlt'));
  assert.ok(text.includes('Ist nicht bestimmbar'));
  assert.ok(!/NaN|undefined/.test(text));
  const expanded = structuredClone(data);
  expanded.vocabularies.topics.push({id:'test_unknown',label:'Ohne Ziel'});
  expanded.warnings = ['Datensatz ausgeschlossen'];
  delete expanded.vocabularies.source_types;
  const incomplete = buildResearchPrompt(expanded,{references});
  for (const text of ['Kein Zielwert für topics/test_unknown','Datensatz ausgeschlossen','Vokabular source_types fehlt']) assert.ok(incomplete.includes(text));
});
test('Übernommene Priorität und ungültiger Zeitfilter', () => {
  const selectedPriority = priorities(a)[0];
  assert.ok(buildResearchPrompt(data,{references,selectedPriority}).includes(`Übernommener Prüfanlass: ${selectedPriority.area}`));
  assert.match(buildResearchPrompt(data,{selection:{from:'2000',to:'1700'}}), /Beginn liegt nach Ende/);
});
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async (url, options) => {
    assert.equal(options.cache, 'no-store');
    assert.ok(String(url).startsWith('file:'));
    return new Response(String(url).endsWith('DATA_MODEL.md') ? 'unavailable' : references['CONTENT_GUIDELINES.md'], {status:String(url).endsWith('DATA_MODEL.md') ? 404 : 200});
  };
  const loaded = await loadPromptReferences();
  test('Referenzfehler isoliert, verfügbare Regeln bleiben erhalten', () => {
    assert.equal(loaded['CONTENT_GUIDELINES.md'], references['CONTENT_GUIDELINES.md']);
    assert.equal(loaded['DATA_MODEL.md'], null);
  });
  for (const value of ['', '<!doctype html><h1>Fallback</h1>']) {
    globalThis.fetch = async () => new Response(value);
    assert.deepEqual(await loadPromptReferences(), {'CONTENT_GUIDELINES.md':null,'DATA_MODEL.md':null});
  }
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.deepEqual(await loadPromptReferences(), {'CONTENT_GUIDELINES.md':null,'DATA_MODEL.md':null});
} finally { globalThis.fetch = originalFetch; }
console.log(`\n${passed} Prompt-Testgruppen bestanden (${prompt.length} Zeichen).`);
