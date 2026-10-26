import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateEvent, validateRelationship } from '../js/validation.js';
import { filterEvents, initialFilters } from '../js/filters.js';
import { simultaneousEvents, derivedValues } from '../js/utils.js';
import { selectedRelationships } from '../js/relationships.js';
import { loadData } from '../js/data-loader.js';

const names = ['events', 'relationships', 'vocabularies', 'persons', 'institutions', 'sources'];
const values = await Promise.all(names.map(name => readFile(new URL(`../data/${name}.json`, import.meta.url), 'utf8').then(JSON.parse)));
const data = Object.fromEntries(names.map((name, i) => [name, values[i]]));
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };
const event = data.events.find(e => e.id === 'E0007');
const relationship = data.relationships[0];
const checkEvent = changes => validateEvent({ ...event, ...changes }, [], data.vocabularies, data);
const checkRelationship = changes => validateRelationship({ ...relationship, ...changes }, [], data.events, data.vocabularies, data.sources);

test('Alle Beispieldatensätze und Referenzen sind gültig', () => {
  assert.ok(data.events.length >= 40);
  assert.ok(data.relationships.length >= 60);
  for (const event of data.events) assert.deepEqual(validateEvent(event, data.events, data.vocabularies, data), []);
  for (const relationship of data.relationships) assert.deepEqual(validateRelationship(relationship, data.relationships, data.events, data.vocabularies, data.sources), []);
  assert.equal(new Set(data.events.map(e => e.primary_discipline)).size, 6);
});
test('Ereignisvalidierung erkennt Pflichtfelder, Werte und verkehrte Zeiträume', () => {
  for (const invalid of [{ title: '' }, { id: '<bad>' }, { start_year: null }, { start_year: NaN }, { end_year: 1500 }, { primary_discipline: [] }, { importance: 1.5 }, { importance: 6 }, { confidence: 'bad' }, { entry_type: 'bad' }, { date_precision: 'bad' }, { scope: 'bad' }, { topics: ['unknown'] }, { persons: ['P9999'] }]) assert.ok(checkEvent(invalid).length, JSON.stringify(invalid));
  assert.ok(validateEvent({ ...event }, [event], data.vocabularies, data).length);
});
test('Beziehungsvalidierung erkennt Referenzen, Selbstbezug und Duplikate', () => {
  for (const invalid of [{ source_id: 'missing' }, { target_id: 'missing' }, { source_id: relationship.target_id }, { strength: 0 }, { strength: 2.5 }, { confidence: 'bad' }, { relationship_type: 'bad' }, { source_ids: ['missing'] }, { description: '' }]) assert.ok(checkRelationship(invalid).length, JSON.stringify(invalid));
  assert.ok(validateRelationship({ ...relationship, id: 'R9999' }, data.relationships, data.events, data.vocabularies, data.sources).length);
});
test('Filter sind über Kategorien kombinierbar, innerhalb einer Kategorie ODER', () => {
  const filters = { ...initialFilters(), disciplines: ['technology_economy'], topics: ['energy', 'mobility'], start: 1760, end: 1840, query: 'Dampf' };
  const result = filterEvents(data.events, filters);
  assert.ok(result.some(e => e.id === event.id));
  assert.ok(result.every(e => e.primary_discipline === 'technology_economy'));
  assert.equal(filterEvents(data.events, { ...filters, topics: ['religion'] }).length, 0);
  assert.ok(filterEvents(data.events, { ...initialFilters(), subdisciplines: ['astronomy'] }).every(e => e.subdisciplines.includes('astronomy')));
});
test('Gleichzeitigkeit nutzt inklusive Intervalle, priorisiert andere Disziplinen', () => {
  const selected = { id: 'a', start_year: 1789, end_year: 1799, primary_discipline: 'a', geography: ['Europe'] };
  const candidates = [selected, { id: 'b', start_year: 1799, end_year: null, primary_discipline: 'b', importance: 3, geography: ['Europe'] }, { id: 'c', start_year: 1800, end_year: null, primary_discipline: 'b', importance: 5, geography: [] }, { id: 'd', start_year: 1790, end_year: 1795, primary_discipline: 'a', importance: 5, geography: [] }];
  assert.deepEqual(simultaneousEvents(selected, candidates).map(e => e.id), ['b', 'd']);
  assert.deepEqual(simultaneousEvents({ ...selected, end_year: null }, candidates).map(e => e.id), []);
});
test('Abgeleitete Werte werden berechnet, nicht in Ereignissen gespeichert', () => {
  assert.equal(derivedValues(event, data.relationships).duration, 0);
  assert.equal(derivedValues(event).century, 18);
  assert.equal(derivedValues(event).is_point_event, true);
  assert.ok(derivedValues(event, data.relationships).relationship_count >= 6);
  for (const key of ['duration', 'century', 'is_point_event', 'relationship_count']) assert.ok(data.events.every(e => !(key in e)));
});
test('Zoomschwellen reduzieren Beziehungen', () => {
  const wide = selectedRelationships(data, event.id, 5);
  const middle = selectedRelationships(data, event.id, 4);
  assert.ok(wide.length < middle.length);
  assert.ok(wide.every(r => r.strength >= 5));
});
test('Reaktionsbeziehungen haben die richtige logische Richtung', () => {
  assert.ok(data.relationships.some(r => r.source_id === 'E0010' && r.target_id === 'E0009' && r.relationship_type === 'reaction_to'));
  assert.ok(!data.relationships.some(r => r.source_id === 'E0009' && r.target_id === 'E0010' && r.relationship_type === 'reaction_to'));
});
const originalFetch = globalThis.fetch;
const damaged = structuredClone(data);
damaged.relationships.push({ ...relationship, id: 'RBROKEN', target_id: 'missing' }, null);
damaged.events.push(null);
globalThis.fetch = async url => {
  const name = String(url).split('/').pop().replace('.json', '');
  return new Response(JSON.stringify(damaged[name]), { headers: { 'Content-Type': 'application/json' } });
};
const loaded = await loadData();
test('Loader überspringt fehlerhafte Referenzen und beschädigte Einzelobjekte', () => {
  assert.equal(loaded.events.length, data.events.length);
  assert.equal(loaded.relationships.length, data.relationships.length);
  assert.equal(loaded.warnings.length, 3);
});
globalThis.fetch = async () => new Response('', { status: 404 });
await assert.rejects(loadData(), /nicht erreichbar/);
test('Loader meldet nicht erreichbare JSON-Dateien verständlich', () => {});
globalThis.fetch = originalFetch;
console.log(`\nGesamt: ${passed} Testgruppen bestanden.`);
