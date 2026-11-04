import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analyze, filterAnalysis, priorities, timeBins, loadAnalysisData } from '../js/analysis-model.js';
import { analysisConfig as config } from '../js/analysis-config.js';
const names=['events','relationships','persons','institutions','sources','vocabularies'];
const data=Object.fromEntries(await Promise.all(names.map(async n=>[n,JSON.parse(await readFile(new URL(`../data/${n}.json`,import.meta.url),'utf8'))])));
let passed=0;const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`);};
const a=analyze(data);
const close=(x,y)=>assert.ok(Math.abs(x-y)<1e-9,`${x} != ${y}`);
test('Aktuelle Basis: alle 6 / 22 / 21 Kategorien und gültige Ziel-IDs',()=>{
  assert.equal(a.n,data.events.length);assert.equal(a.disciplines.length,6);assert.equal(a.subdisciplines.length,22);assert.equal(a.topics.length,21);
  for(const key of ['disciplines','subdisciplines','topics'])assert.deepEqual(Object.keys(config[key]).sort(),data.vocabularies[key].map(x=>x.id).sort());
  assert.equal(Object.values(config.disciplines).reduce((s,x)=>s+x,0),100);
  for(const d of data.vocabularies.disciplines)assert.equal(data.vocabularies.subdisciplines.filter(s=>s.discipline_id===d.id).reduce((n,s)=>n+config.subdisciplines[s.id],0),100);
});
test('Hauptdisziplinen summieren sich zu 100 Prozent; Sollzahlen und Differenzen stimmen',()=>{
  close(a.disciplines.reduce((s,x)=>s+x.actual,0),100);
  close(a.disciplines.reduce((s,x)=>s+x.expected,0),a.n);
  for(const d of a.disciplines){close(d.difference,d.count-a.n*d.target/100);close(d.delta,d.actual-d.target);}
});
test('Aktuelle Themen und Unterdisziplinen gegen unabhängige Zählung',()=>{
  for(const t of a.topics){assert.equal(t.count,data.events.filter(e=>e.topics.includes(t.id)).length);close(t.actual,t.count/a.n*100);close(t.tolerance,Math.max(3,t.target*.3));}
  for(const s of a.subdisciplines){const ids=data.vocabularies.subdisciplines.filter(x=>x.discipline_id===s.discipline_id).map(x=>x.id);const denominator=data.events.flatMap(e=>e.subdisciplines).filter(id=>ids.includes(id)).length;assert.equal(s.denominator,denominator);}
});
const fixture={...data,events:[
  {id:'a',title:'A',start_year:1700,end_year:1950,primary_discipline:'science',subdisciplines:['physics','chemistry','physics'],topics:['knowledge','science','knowledge'],geography:['Europe','France','Europe'],source_ids:['S'],importance:5},
  {id:'b',title:'B',start_year:1800,end_year:null,primary_discipline:'art_culture',subdisciplines:['physics'],topics:['knowledge'],geography:['France'],source_ids:['missing'],importance:1},
  {id:'c',title:'C',primary_discipline:'science'},
],sources:[{id:'S'}],persons:[],institutions:[],relationships:[{id:'r',source_id:'a',target_id:'b',source_ids:['S']},{id:'bad',source_id:'a',target_id:'missing'},{id:'self',source_id:'a',target_id:'a'}]};
const f=analyze(fixture);
test('Mehrfachzuordnungen dedupliziert; Vokabular-Eltern unabhängig von primärer Disziplin',()=>{
  assert.equal(f.topicAssignments,3);assert.equal(f.subAssignments,3);assert.equal(f.subEvents,2);
  const physics=f.subdisciplines.find(s=>s.id==='physics');assert.equal(physics.count,2);assert.equal(physics.denominator,3);close(physics.actual,200/3);
  assert.equal(f.geography.find(g=>g.id==='Europe').count,1);assert.equal(f.geography.find(g=>g.id==='France').count,2);assert.equal(f.multipleGeography,1);
});
test('Themenmatrix symmetrisch, Diagonale zählt einzelne Ereignisse',()=>{
  const i=data.vocabularies.topics.findIndex(t=>t.id==='knowledge'),j=data.vocabularies.topics.findIndex(t=>t.id==='science');
  assert.equal(f.topicMatrix[i][i],2);assert.equal(f.topicMatrix[i][j],1);assert.equal(f.topicMatrix[j][i],1);
});
test('Lange Zeiträume zählen einmal; fehlende Datierung separat; Endjahr in Zeitspanne',()=>{
  assert.equal(f.time.reduce((n,t)=>n+t.count,0),2);assert.equal(f.time.reduce((n,t)=>n+t.periods,0),1);assert.equal(f.undated,1);assert.equal(f.to,1950);
  const bins=timeBins([{start_year:-1000000},{start_year:2026}]);assert.ok(bins.length<=80);
  const gaps=timeBins([{start_year:-150},{start_year:250}]);assert.equal(gaps.length,5);
});
test('Filter kombinierbar und Zeiträume inklusiv überlappend; umgekehrter Filter leer',()=>{
  assert.deepEqual(filterAnalysis(fixture.events,{discipline:'science',topic:'knowledge',subdiscipline:'physics',geography:'Europe',importance:'5',from:'1900',to:'1901'}).map(e=>e.id),['a']);
  assert.equal(filterAnalysis(fixture.events,{from:'2000',to:'1700'}).length,0);
  assert.deepEqual(filterAnalysis(fixture.events,{from:'1800',to:'1800'}).map(e=>e.id),['a','b']);
});
test('Quellenreferenzen und Beziehungen prüfen; Filtergrenzen berücksichtigen',()=>{
  assert.equal(f.noSources,2);assert.equal(f.brokenSourceRefs,1);assert.equal(f.brokenRelations,2);assert.equal(f.isolated,1);assert.equal(f.degree.a,1);
  const subset=analyze(fixture,[fixture.events[0]]);assert.equal(subset.relations,1);assert.equal(subset.internalRelations,0);assert.equal(subset.isolated,0);
});
test('Leerer Bestand zeigt Kategorien ohne NaN oder erfundene Prozentanteile',()=>{
  const empty=analyze({...fixture,events:[],relationships:[]});assert.equal(empty.disciplines.length,6);assert.equal(empty.subdisciplines.length,22);assert.equal(empty.topics.length,21);
  assert.ok(empty.disciplines.every(d=>d.actual===null));assert.equal(empty.from,null);assert.deepEqual(empty.time,[]);assert.ok(!JSON.stringify(empty).includes('NaN'));
});
test('Erweiterte Vokabulare erhalten keinen erfundenen Zielwert',()=>{
  const expanded=structuredClone(fixture);expanded.vocabularies.topics.push({id:'new',label:'Neu'});const t=analyze(expanded).topics.at(-1);assert.equal(t.count,0);assert.equal(t.target,null);assert.equal(t.delta,null);
});
test('Rechercheprioritäten unterscheiden Qualität, Zahlen und qualitative Hinweise',()=>{
  const rows=priorities(a);assert.ok(rows.some(p=>p.type==='Datenqualität'));assert.ok(rows.some(p=>p.type==='Quantitative Orientierung'));assert.ok(rows.some(p=>p.type==='Qualitativer Hinweis'));
  assert.ok(rows.filter(p=>p.type==='Qualitativer Hinweis').every(p=>p.target===null));
  assert.ok(priorities(f).some(p=>p.area==='Ungültige Quellenreferenzen'));
});
const original=globalThis.fetch;
globalThis.fetch=async(url,options)=>{assert.equal(options.cache,'no-store');const name=String(url).split('/').at(-1).replace('.json','');return new Response(JSON.stringify(name==='events'?[...fixture.events,null,fixture.events[0]]:fixture[name]));};
const loaded=await loadAnalysisData();test('Loader lädt ohne Cache und meldet beschädigte / doppelte Zeilen',()=>{assert.equal(loaded.events.length,3);assert.equal(loaded.warnings.length,2);});
globalThis.fetch=async()=>new Response('',{status:404});await assert.rejects(loadAnalysisData(),/nicht erreichbar/);passed++;
globalThis.fetch=async()=>new Response('{broken');await assert.rejects(loadAnalysisData());passed++;
globalThis.fetch=original;
console.log(`\n${passed} Analyse-Testgruppen bestanden; aktuelle Basis: ${a.n} Ereignisse, ${a.relations} Beziehungen.`);
