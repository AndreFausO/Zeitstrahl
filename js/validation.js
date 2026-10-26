const validId = id => typeof id === 'string' && /^[A-Za-z0-9_-]+$/.test(id);
const inVocabulary = (vocabulary, value) => vocabulary.some(item => item.id === value);
const level = value => Number.isInteger(value) && value >= 1 && value <= 5;
const confidenceValues = ['high', 'medium', 'low'];
const arrays = ['secondary_disciplines', 'subdisciplines', 'topics', 'geography', 'persons', 'institutions', 'source_ids'];

export function validateEvent(event, events, vocabularies, data = {}) {
  const errors = [];
  if (!validId(event.id)) errors.push('ID: Nur Buchstaben, Zahlen, Bindestrich und Unterstrich sind erlaubt.');
  if (events.some(other => other !== event && other.id === event.id)) errors.push('Die Ereignis-ID ist bereits vergeben.');
  if (typeof event.title !== 'string' || !event.title.trim()) errors.push('Ein Titel ist erforderlich.');
  if (!inVocabulary(vocabularies.entry_types, event.entry_type)) errors.push('Der Eintragstyp ist ungültig.');
  if (!Number.isFinite(event.start_year)) errors.push('Das Startjahr muss eine gültige Zahl sein.');
  if (event.end_year !== null && (!Number.isFinite(event.end_year) || event.end_year < event.start_year)) errors.push('Das Endjahr muss eine Zahl sein und darf nicht vor dem Startjahr liegen.');
  if (typeof event.primary_discipline !== 'string' || !inVocabulary(vocabularies.disciplines, event.primary_discipline)) errors.push('Genau eine gültige Hauptdisziplin ist erforderlich.');
  if (!level(event.importance)) errors.push('Die Bedeutung muss eine ganze Zahl von 1 bis 5 sein.');
  if (!confidenceValues.includes(event.confidence)) errors.push('Die Sicherheit der Einordnung ist ungültig.');
  if (!inVocabulary(vocabularies.date_precisions, event.date_precision)) errors.push('Die Zeitgenauigkeit ist ungültig.');
  if (!inVocabulary(vocabularies.scopes, event.scope)) errors.push('Die räumliche Reichweite ist ungültig.');
  for (const key of ['date_label', 'short_description', 'long_description', 'notes']) {
    if (typeof event[key] !== 'string') errors.push(`${key}: Ein Text wird erwartet.`);
  }
  for (const key of arrays) {
    if (!Array.isArray(event[key]) || event[key].some(value => typeof value !== 'string')) errors.push(`${key}: Eine Liste von Textwerten wird erwartet.`);
  }
  for (const [key, vocabulary] of [['topics', 'topics'], ['secondary_disciplines', 'disciplines'], ['subdisciplines', 'subdisciplines']]) {
    if (Array.isArray(event[key]) && event[key].some(id => !inVocabulary(vocabularies[vocabulary], id))) errors.push(`${key}: Mindestens ein Wert ist unbekannt.`);
  }
  for (const [key, collection] of [['persons', 'persons'], ['institutions', 'institutions'], ['source_ids', 'sources']]) {
    if (data[collection] && Array.isArray(event[key]) && event[key].some(id => !data[collection].some(item => item.id === id))) errors.push(`${key}: Mindestens eine Referenz existiert nicht.`);
  }
  return errors;
}

export function validateRelationship(relationship, relationships, events, vocabularies, sources = []) {
  const errors = [];
  if (!validId(relationship.id)) errors.push('Eine gültige Beziehungs-ID ist erforderlich.');
  if (relationships.some(other => other !== relationship && other.id === relationship.id)) errors.push('Die Beziehungs-ID ist bereits vergeben.');
  if (!events.some(event => event.id === relationship.source_id)) errors.push('Das Ausgangsereignis existiert nicht.');
  if (!events.some(event => event.id === relationship.target_id)) errors.push('Das Zielereignis existiert nicht.');
  if (relationship.source_id === relationship.target_id) errors.push('Ausgang und Ziel müssen verschieden sein.');
  if (!inVocabulary(vocabularies.relationship_types, relationship.relationship_type)) errors.push('Der Beziehungstyp ist ungültig.');
  if (!level(relationship.strength)) errors.push('Die Stärke muss eine ganze Zahl von 1 bis 5 sein.');
  if (!confidenceValues.includes(relationship.confidence)) errors.push('Die Sicherheit der Beziehung ist ungültig.');
  if (typeof relationship.description !== 'string' || !relationship.description.trim()) errors.push('Bitte beschreibe die historische Verbindung.');
  if (relationships.some(other => other !== relationship && other.source_id === relationship.source_id && other.target_id === relationship.target_id && other.relationship_type === relationship.relationship_type)) errors.push('Diese Beziehung ist bereits vorhanden (gleicher Ausgang, gleiches Ziel und gleicher Typ).');
  if (relationship.start_year != null && !Number.isFinite(relationship.start_year)) errors.push('Das Startjahr der Beziehung ist ungültig.');
  if (relationship.end_year != null && (!Number.isFinite(relationship.end_year) || relationship.start_year == null || relationship.end_year < relationship.start_year)) errors.push('Der Zeitraum der Beziehung ist ungültig.');
  if (!Array.isArray(relationship.geography)) errors.push('Geografie muss eine Liste sein.');
  if (!Array.isArray(relationship.source_ids) || relationship.source_ids.some(id => !sources.some(source => source.id === id))) errors.push('Mindestens eine Quellenreferenz ist ungültig.');
  return errors;
}
