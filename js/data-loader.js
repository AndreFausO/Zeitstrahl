import { validateEvent, validateRelationship } from './validation.js';

export async function loadData() {
  const names = ['events', 'relationships', 'persons', 'institutions', 'sources', 'vocabularies'];
  const values = await Promise.all(names.map(async name => {
    let response;
    try { response = await fetch(new URL(`../data/${name}.json`, import.meta.url)); }
    catch { throw new Error(`${name}.json konnte nicht geladen werden. Bitte prüfe, ob der lokale Webserver erreichbar ist.`); }
    if (!response.ok) throw new Error(`${name}.json ist nicht erreichbar (HTTP ${response.status}).`);
    try { return await response.json(); }
    catch { throw new Error(`${name}.json enthält kein gültiges JSON.`); }
  }));
  const data = Object.fromEntries(names.map((name, index) => [name, values[index]]));
  for (const name of names.filter(name => name !== 'vocabularies')) {
    if (!Array.isArray(data[name])) throw new Error(`${name}.json muss eine Liste enthalten.`);
  }
  for (const name of ['disciplines', 'entry_types', 'relationship_types', 'topics', 'subdisciplines', 'date_precisions', 'scopes', 'confidence']) {
    if (!Array.isArray(data.vocabularies[name])) throw new Error(`Das Vokabular „${name}“ fehlt.`);
  }
  data.warnings = [];
  const eventIds = new Set();
  data.events = data.events.filter(event => {
    if (!event || typeof event !== 'object') { data.warnings.push('Ungültiger Ereignisdatensatz.'); return false; }
    const errors = validateEvent(event, [], data.vocabularies, data);
    if (eventIds.has(event.id)) errors.push('Doppelte ID.');
    eventIds.add(event.id);
    if (errors.length) data.warnings.push(`${event.id ?? '?'}: ${errors.join(' ')}`);
    return !errors.length;
  });
  const accepted = [];
  for (const relationship of data.relationships) {
    if (!relationship || typeof relationship !== 'object') { data.warnings.push('Ungültiger Beziehungsdatensatz.'); continue; }
    const errors = validateRelationship(relationship, accepted, data.events, data.vocabularies, data.sources);
    if (errors.length) data.warnings.push(`${relationship.id ?? '?'}: ${errors.join(' ')}`);
    else accepted.push(relationship);
  }
  data.relationships = accepted;
  if (data.warnings.length) console.warn('Zeitstrahl: Ungültige Einträge wurden übersprungen.', data.warnings);
  return data;
}
