import { $, escapeHTML as esc, icon, labelFor, simultaneousEvents } from './utils.js';
import { loadData } from './data-loader.js';
import { showError } from './utils.js';

export function relationshipList(event, data, linkMode = false) {
  const relationships = data.relationships.filter(r => r.source_id === event.id || r.target_id === event.id).sort((a, b) => b.strength - a.strength);
  return relationships.map(relationship => {
    const outgoing = relationship.source_id === event.id;
    const other = data.events.find(item => item.id === (outgoing ? relationship.target_id : relationship.source_id));
    const type = labelFor(data.vocabularies.relationship_types, relationship.relationship_type);
    const sentence = `${outgoing ? event.title : other.title} ${type} ${outgoing ? other.title : event.title}`;
    const tag = linkMode ? 'a' : 'button';
    return `<${tag} ${linkMode ? `href="event.html?id=${encodeURIComponent(other.id)}"` : `type="button" data-select="${other.id}"`} class="related-item" title="${esc(relationship.description)}" aria-label="${esc(sentence)}"><small class="relation-label">${outgoing ? '↗' : '↙'} ${esc(type)} ${outgoing ? '' : '· eingehend'}</small><strong>${esc(other.title)} <span aria-hidden="true">↗</span></strong>${linkMode ? `<small>${esc(relationship.description)} · Stärke ${relationship.strength}/5 · Sicherheit ${esc(labelFor(data.vocabularies.confidence, relationship.confidence))}</small>` : ''}</${tag}>`;
  }).join('') || '<p class="help-copy">Für diesen Eintrag sind noch keine Verbindungen hinterlegt.</p>';
}

function parallelList(event, data, linkMode = false) {
  const events = simultaneousEvents(event, data.events).slice(0, 5);
  return events.map(other => {
    const discipline = data.vocabularies.disciplines.find(d => d.id === other.primary_discipline);
    const tag = linkMode ? 'a' : 'button';
    return `<${tag} ${linkMode ? `href="event.html?id=${other.id}"` : `type="button" data-select="${other.id}"`} class="related-item"><strong>${esc(other.title)}</strong><small>${esc(other.date_label)} <span aria-hidden="true">·</span> ${esc(discipline.label)}</small></${tag}>`;
  }).join('') || '<p class="help-copy">Keine zeitlich überlappenden Einträge im aktuellen Datenbestand.</p>';
}

function personList(event, data) {
  return event.persons.map(id => data.persons.find(p => p.id === id)).filter(Boolean).map(person => `<p class="panel-person">${esc(person.name)} <small>${person.birth_year}–${person.death_year ?? '…'}</small></p>`).join('') || '<p class="help-copy">Keine Personen hinterlegt.</p>';
}

function eventTags(event, data) {
  const discipline = data.vocabularies.disciplines.find(d => d.id === event.primary_discipline);
  return `<div class="chip-row"><span class="chip discipline" style="--discipline:${discipline.color};--tint:${discipline.tint}">${icon(discipline.id)}${esc(discipline.label)}</span>${event.topics.map(id => `<span class="chip">${esc(labelFor(data.vocabularies.topics, id))}</span>`).join('')}</div>`;
}

export function renderDetailPanel(panel, event, data, onSelect, onClose) {
  panel.hidden = !event;
  if (!event) { panel.innerHTML = ''; return; }
  panel.setAttribute('aria-label', `Details: ${event.title}`);
  panel.innerHTML = `<div class="panel-top"><p class="eyebrow">IM ZUSAMMENHANG</p><button type="button" class="icon-button" id="close-panel" aria-label="Detailpanel schließen">${icon('close')}</button></div><h2>${esc(event.title)}</h2><p class="panel-date">${esc(event.date_label)}</p>${eventTags(event, data)}<p class="panel-description">${esc(event.short_description)}</p>
    <section class="panel-section"><div class="section-heading"><h3>Personen</h3></div>${personList(event, data)}${event.subdisciplines.length ? `<p class="help-copy">Fachgebiete: ${event.subdisciplines.map(id => esc(labelFor(data.vocabularies.subdisciplines, id))).join(', ')}</p>` : ''}</section>
    <section class="panel-section"><div class="section-heading"><h3>Was geschah gleichzeitig?</h3>${icon('link')}</div>${parallelList(event, data)}<p class="help-copy">Zeitliche Überschneidung bedeutet keinen ursächlichen Zusammenhang. Die Auswahl bezieht sich auf den gesamten Datenbestand.</p></section>
    <a class="button primary" href="event.html?id=${event.id}">Mehr erfahren ${icon('arrow')}</a>`;
  $('#close-panel', panel).addEventListener('click', onClose);
  panel.querySelectorAll('[data-select]').forEach(button => button.addEventListener('click', () => onSelect(button.dataset.select)));
  panel.scrollTop = 0;
}

export async function initEventPage() {
  const container = $('#event-content');
  if (!container) return;
  try {
    const data = await loadData();
    const id = new URLSearchParams(location.search).get('id');
    const event = data.events.find(item => item.id === id);
    if (!event) { container.innerHTML = '<div class="empty-state"><h1>Dieser Eintrag wurde nicht gefunden.</h1><p>Wähle ein Ereignis auf dem Zeitstrahl aus.</p><a class="button primary" href="index.html">Zeitstrahl öffnen</a></div>'; return; }
    document.title = `${event.title} — Zeitstrahl`;
    const sources = event.source_ids.map(id => data.sources.find(source => source.id === id)).filter(Boolean);
    const sourceHtml = sources.map(source => `<li>${source.url && /^https?:\/\//.test(source.url) ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a>` : esc(source.title)}<br>${esc(source.author)}${source.year ? `, ${source.year}` : ''} · ${esc(source.publisher)}</li>`).join('');
    container.innerHTML = `<a href="index.html?event=${event.id}" class="back-link">← Im Zeitstrahl entdecken</a><article class="event-article">${eventTags(event, data)}<h1>${esc(event.title)}</h1><p class="panel-date">${esc(event.date_label)} · ${esc(labelFor(data.vocabularies.entry_types, event.entry_type))}</p><div class="event-introduction"><p class="long-description">${esc(event.long_description)}</p><figure class="event-image-placeholder"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="7" width="38" height="34" rx="4"/><circle cx="16" cy="18" r="4"/><path d="m6 34 11-10 8 7 7-9 10 12"/></svg><figcaption><span>Bildplatzhalter</span><strong>${esc(event.title)}</strong></figcaption></figure></div><div class="detail-columns"><section><div class="section-heading"><h3>Historische Verbindungen</h3></div>${relationshipList(event, data, true)}<div class="section-heading"><h3>Was geschah gleichzeitig?</h3></div>${parallelList(event, data, true)}<p class="help-copy">Dynamisch aus Zeiträumen berechnet, ohne Aussage über Kausalität.</p></section><aside><div class="section-heading"><h3>Personen</h3></div>${personList(event, data)}<div class="section-heading"><h3>Einordnung</h3></div><dl class="metadata"><div><dt>Geografie</dt><dd>${event.geography.map(esc).join(', ')}</dd></div><div><dt>Reichweite</dt><dd>${esc(labelFor(data.vocabularies.scopes, event.scope))}</dd></div><div><dt>Zeitgenauigkeit</dt><dd>${esc(labelFor(data.vocabularies.date_precisions, event.date_precision))}</dd></div><div><dt>Sicherheit</dt><dd>${esc(labelFor(data.vocabularies.confidence, event.confidence))}</dd></div><div><dt>Bedeutung</dt><dd>${event.importance} von 5</dd></div><div><dt>Fachgebiete</dt><dd>${event.subdisciplines.map(id => esc(labelFor(data.vocabularies.subdisciplines, id))).join(', ') || '—'}</dd></div><div><dt>Weitere Disziplinen</dt><dd>${event.secondary_disciplines.map(id => esc(labelFor(data.vocabularies.disciplines, id))).join(', ') || '—'}</dd></div></dl>${event.institutions.map(id => data.institutions.find(i => i.id === id)).filter(Boolean).map(i => `<div class="section-heading"><h3>${esc(i.name)}</h3></div><p class="help-copy">${esc(i.place)} · ${i.founded_year}–${i.dissolved_year ?? 'heute'}<br>${esc(i.short_description)}</p>`).join('')}<div class="section-heading"><h3>Quellen & weiterführende Literatur</h3></div>${sourceHtml ? `<ol class="source-list">${sourceHtml}</ol>` : '<p class="help-copy">Für diesen Beispieleintrag sind noch keine Quellen hinterlegt.</p>'}<p class="help-copy">${esc(event.notes)}</p></aside></div></article>`;
  } catch (error) { showError(container, error); }
}
