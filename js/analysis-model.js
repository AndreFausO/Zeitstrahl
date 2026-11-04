import { analysisConfig as config } from './analysis-config.js';
export const unique = value => [...new Set(Array.isArray(value) ? value.filter(x => typeof x === 'string' && x.trim()) : [])];
export const percent = (n, total) => total ? n / total * 100 : null;
const validYear = x => typeof x === 'number' && Number.isFinite(x);
export const finish = e => validYear(e.end_year) ? e.end_year : e.start_year;
export function filterAnalysis(events, f = {}) {
  if (f.from !== '' && f.from != null && f.to !== '' && f.to != null && Number(f.from) > Number(f.to)) return [];
  return events.filter(e => (!f.discipline || e.primary_discipline === f.discipline)
    && (!f.subdiscipline || unique(e.subdisciplines).includes(f.subdiscipline))
    && (!f.topic || unique(e.topics).includes(f.topic))
    && (!f.geography || unique(e.geography).includes(f.geography))
    && (!f.importance || e.importance === Number(f.importance))
    && (f.from === '' || f.from == null || (validYear(e.start_year) && finish(e) >= Number(f.from)))
    && (f.to === '' || f.to == null || (validYear(e.start_year) && e.start_year <= Number(f.to))));
}
function comparison(item, count, denominator, target, tolerance = null) {
  const actual = percent(count, denominator);
  const delta = actual == null || target == null ? null : actual - target;
  return { ...item, count, denominator, actual, target: target ?? null, tolerance,
    delta, expected: target == null ? null : denominator * target / 100,
    difference: target == null ? null : count - denominator * target / 100,
    relative: delta == null || !target ? null : delta / target * 100,
    status: delta == null ? 'Keine Basis' : tolerance == null ? (delta < 0 ? 'Unter Ziel' : delta > 0 ? 'Über Ziel' : 'Am Ziel') : delta < -tolerance ? 'Unter Korridor' : delta > tolerance ? 'Über Korridor' : 'Im Korridor' };
}
export function timeBins(events, maxBins = config.maxTimeBins) {
  const dated = events.filter(e => validYear(e.start_year));
  if (!dated.length) return [];
  const low = Math.min(...dated.map(e => e.start_year));
  const high = Math.max(...dated.map(e => e.start_year));
  let width = 100;
  while (Math.floor(high / width) - Math.floor(low / width) + 1 > maxBins) width *= 10;
  const bins = [];
  for (let from = Math.floor(low / width) * width; from <= high; from += width) {
    bins.push({ id: String(from), label: `${from} bis ${from + width - 1}`, from, to: from + width - 1 });
  }
  return bins;
}
export function analyze(data, events = data.events, bins = timeBins(data.events)) {
  const v = data.vocabularies, n = events.length;
  const ids = new Set(events.map(e => e.id)), allIds = new Set(data.events.map(e => e.id));
  const sourceIds = new Set(data.sources.map(s => s.id));
  const hasSource = e => unique(e.source_ids).some(id => sourceIds.has(id));
  const validRelations = data.relationships.filter(r => allIds.has(r.source_id) && allIds.has(r.target_id) && r.source_id !== r.target_id);
  const relations = validRelations.filter(r => ids.has(r.source_id) || ids.has(r.target_id));
  const degree = Object.fromEntries(events.map(e => [e.id, 0]));
  for (const r of relations) for (const id of new Set([r.source_id, r.target_id])) if (ids.has(id)) degree[id]++;
  const disciplines = v.disciplines.map(d => comparison(d, events.filter(e => e.primary_discipline === d.id).length, n, config.disciplines[d.id], config.disciplineTolerance));
  const subdisciplines = v.subdisciplines.map(s => {
    // Parent is defined by the vocabulary, independent of primary/secondary discipline.
    const siblings = new Set(v.subdisciplines.filter(x => x.discipline_id === s.discipline_id).map(x => x.id));
    const denominator = events.reduce((sum,e) => sum + unique(e.subdisciplines).filter(id => siblings.has(id)).length, 0);
    const count = events.filter(e => unique(e.subdisciplines).includes(s.id)).length;
    return { ...comparison(s, count, denominator, config.subdisciplines[s.id]), eventCount: count,
      parentEvents: events.filter(e => unique(e.subdisciplines).some(id => siblings.has(id))).length };
  });
  const topics = v.topics.map(t => comparison(t, events.filter(e => unique(e.topics).includes(t.id)).length, n, config.topics[t.id], Math.max(config.topicMinimumTolerance, (config.topics[t.id] ?? 0) * config.topicRelativeTolerance)));
  const topicMatrix = v.topics.map(a => v.topics.map(b => events.filter(e => unique(e.topics).includes(a.id) && unique(e.topics).includes(b.id)).length));
  const pairs = [];
  v.topics.forEach((a,i) => v.topics.forEach((b,j) => { if (j > i && topicMatrix[i][j]) pairs.push({ a:a.id, b:b.id, count:topicMatrix[i][j] }); }));
  pairs.sort((a,b) => b.count-a.count);
  const distribution = group => {
    const subset = events.filter(group);
    return { count:subset.length, sourced:subset.filter(hasSource).length,
      disciplines: v.disciplines.map(d => subset.filter(e => e.primary_discipline === d.id).length) };
  };
  const time = bins.map(b => ({ ...b, ...distribution(e => validYear(e.start_year) && e.start_year >= b.from && e.start_year <= b.to),
    periods: events.filter(e => validYear(e.start_year) && e.start_year >= b.from && e.start_year <= b.to && finish(e) > e.start_year).length }));
  const geography = [...new Set(data.events.flatMap(e => unique(e.geography)))].sort().map(label => ({ id:label,label,...distribution(e => unique(e.geography).includes(label)) }));
  const byId = new Map(data.events.map(e => [e.id,e]));
  const crossMatrix = v.disciplines.map(a => v.disciplines.map(b => relations.filter(r => byId.get(r.source_id)?.primary_discipline === a.id && byId.get(r.target_id)?.primary_discipline === b.id).length));
  const dated = events.filter(e => validYear(e.start_year));
  const recognized = (field, vocabulary) => events.reduce((s,e) => s + unique(e[field]).filter(id => vocabulary.some(v => v.id === id)).length, 0);
  const unknown = events.filter(e => !v.disciplines.some(d => d.id === e.primary_discipline) || unique(e.topics).some(id => !v.topics.some(t => t.id === id)) || unique(e.subdisciplines).some(id => !v.subdisciplines.some(s => s.id === id)));
  return { n, disciplines, subdisciplines, topics, topicMatrix, pairs, time, geography, crossMatrix,
    degree, relations:relations.length, internalRelations:relations.filter(r => ids.has(r.source_id) && ids.has(r.target_id)).length,
    sourceCoverage: disciplines.map(d => ({ id:d.id, label:d.label, ...distribution(e => e.primary_discipline === d.id) })),
    noSources:events.filter(e => !hasSource(e)).length, isolated:events.filter(e => !degree[e.id]).length,
    noGeography:events.filter(e => !unique(e.geography).length).length,
    multipleGeography:events.filter(e => unique(e.geography).length > 1).length,
    subEvents:events.filter(e => unique(e.subdisciplines).some(id => v.subdisciplines.some(s => s.id === id))).length,
    multipleSubs:events.filter(e => unique(e.subdisciplines).length > 1).length,
    topicAssignments:recognized('topics',v.topics), subAssignments:recognized('subdisciplines',v.subdisciplines),
    undated:n-dated.length, unknownClassifications:unknown.length,
    brokenSourceRefs:events.reduce((s,e) => s+unique(e.source_ids).filter(id => !sourceIds.has(id)).length,0),
    brokenRelations:data.relationships.length-validRelations.length,
    unsourcedRelations:relations.filter(r => !hasSource(r)).length,
    from:dated.length ? Math.min(...dated.map(e => e.start_year)) : null,
    to:dated.length ? Math.max(...dated.map(finish)) : null,
    persons:new Set(events.flatMap(e => unique(e.persons)).filter(id => data.persons.some(p => p.id === id))).size,
    institutions:new Set(events.flatMap(e => unique(e.institutions)).filter(id => data.institutions.some(p => p.id === id))).size,
    sources:new Set([...events,...relations].flatMap(e => unique(e.source_ids)).filter(id => sourceIds.has(id))).size,
  };
}
export function priorities(a) {
  const result = [];
  for (const [kind,rows,field] of [['Disziplin',a.disciplines,'discipline'],['Unterdisziplin',a.subdisciplines,'subdiscipline'],['Thema',a.topics,'topic']]) {
    for (const r of rows) if (r.target != null && (r.actual == null || r.delta < -(r.tolerance ?? 0))) {
      result.push({ type:'Quantitative Orientierung', area:`${kind}: ${r.label}`, count:r.count, actual:r.actual, target:r.target, delta:r.delta,
        score:r.actual == null ? 0 : -r.delta / r.target, selection:{ [field]:r.id },
        reason:r.actual == null ? 'Keine Zuordnungen als Berechnungsbasis.' : `Unter dem redaktionellen ${r.tolerance == null ? 'Ziel' : 'Korridor'}; Bezugsgröße: ${r.denominator}.`,
        direction:'Signifikante gesellschaftliche Veränderungen und langfristige Wirkungen prüfen; keine Quote auffüllen.' });
    }
  }
  for (const [area,count,direction] of [['Ereignisse ohne gültige Quellen',a.noSources,'Vorhandene Aussagen mit belastbaren Belegen prüfen.'],['Isolierte Ereignisse',a.isolated,'Mögliche Verbindungen prüfen und nur mit spezifischem Beleg ergänzen.'],['Fehlende Geografie',a.noGeography,'Historischen Raum anhand belastbarer Quellen klären.'],['Ungültige Klassifikationen',a.unknownClassifications,'IDs anhand des aktuellen Vokabulars redaktionell prüfen.'],['Ungültige Quellenreferenzen',a.brokenSourceRefs,'Verweise auf existierende Quellen prüfen.'],['Ungültige Beziehungen im Gesamtbestand',a.brokenRelations,'Endpunkte und Selbstbezüge prüfen.'],['Beziehungen ohne gültige Quellen',a.unsourcedRelations,'Belege für die konkrete historische Verbindung prüfen.'],['Fehlende Datierung',a.undated,'Zeitliche Einordnung quellenbasiert prüfen.']]) if (count) result.push({ type:'Datenqualität', area,count, actual:null,target:null,delta:null,score:2+count/Math.max(1,a.n), selection:{},reason:'Struktureller Prüfanlass, kein Nachweis historischer Unwichtigkeit.',direction });
  const lowPeriods = a.time.filter(t => t.count < a.n / Math.max(1,a.time.length));
  for (const t of lowPeriods) result.push({ type:'Qualitativer Hinweis',area:`Zeitraum: ${t.label}`,count:t.count,actual:percent(t.count,a.n),target:null,delta:null,score:0.5/(t.count+1),selection:{from:t.from,to:t.to},reason:'Weniger Startdatierungen als im Mittel der gleich breiten Zeitabschnitte. Keine historische Sollverteilung.',direction:'Überlieferung, zeitliche Auswahl und lang andauernde Entwicklungen prüfen.' });
  for (const g of a.geography.filter(g => g.count <= 1)) result.push({type:'Qualitativer Hinweis',area:`Geografie: ${g.label}`,count:g.count,actual:percent(g.count,a.n),target:null,delta:null,score:0.2,selection:{geography:g.label},reason:'Seltenes vorhandenes Schlagwort; Orts- und Regionsgrößen sind nicht vergleichbar.',direction:'Regionale Perspektiven und Quellenlage prüfen, alternative geografische Bezeichnungen beachten.'});
  for (const d of a.disciplines) if (d.count && a.sourceCoverage.find(s => s.id === d.id).sourced < d.count) result.push({type:'Datenqualität',area:`Quellen × ${d.label}`,count:d.count-a.sourceCoverage.find(s => s.id === d.id).sourced,actual:null,target:null,delta:null,score:1,selection:{discipline:d.id},reason:'Ereignisse dieser Disziplin ohne gültige Quellenzuordnung.',direction:'Bestehende Einträge belegen, bevor neue Kandidaten ergänzt werden.'});
  return result.sort((a,b) => b.score-a.score || a.area.localeCompare(b.area,'de'));
}
export async function loadAnalysisData() {
  const names = ['events','vocabularies','persons','institutions','sources','relationships'];
  const entries = await Promise.all(names.map(async name => {
    const response = await fetch(new URL(`../data/${name}.json`,import.meta.url), {cache:'no-store'});
    if (!response.ok) throw new Error(`${name}.json nicht erreichbar (HTTP ${response.status}).`);
    const value = await response.json();
    if (name !== 'vocabularies' && !Array.isArray(value)) throw new Error(`${name}.json muss eine Liste enthalten.`);
    return [name,value];
  }));
  const data = Object.fromEntries(entries);
  for (const key of ['disciplines','subdisciplines','topics']) if (!Array.isArray(data.vocabularies[key])) throw new Error(`Vokabular ${key} fehlt.`);
  data.warnings = [];
  for (const key of names.filter(k => k !== 'vocabularies')) {
    const ids = new Set();
    data[key] = data[key].filter(row => {
      if (!row || typeof row !== 'object' || typeof row.id !== 'string' || ids.has(row.id)) { data.warnings.push(`${key}: beschädigter Datensatz oder doppelte ID ausgeschlossen.`); return false; }
      ids.add(row.id); return true;
    });
  }
  return data;
}
