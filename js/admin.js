import { loadData } from './data-loader.js';
import { CONFIG } from './config.js';
import { $, $$, escapeHTML as esc, labelFor, downloadJSON, showError } from './utils.js';
import { validateEvent, validateRelationship } from './validation.js';

async function initAdmin() {
  const container = $('#admin-app');
  try {
    const data = await loadData();
    const originals = structuredClone({ events: data.events, relationships: data.relationships });
    let mode = 'events';
    let selectedId = null;
    let formDirty = false;
    let draftMessage = '';
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        const draft = JSON.parse(saved);
        if (!Array.isArray(draft.events) || !Array.isArray(draft.relationships)) throw new Error('Unbekanntes Entwurfsformat.');
        const errors = validateAll(draft.events, draft.relationships);
        if (errors.length) throw new Error(errors[0]);
        data.events = draft.events;
        data.relationships = draft.relationships;
        draftMessage = 'Dein gespeicherter Browser-Entwurf wurde wiederhergestellt.';
      }
    } catch (error) { draftMessage = `Der lokale Entwurf konnte nicht geladen werden: ${error.message} Die JSON-Originaldaten werden angezeigt.`; }
    container.innerHTML = `<p class="admin-info">Die Werkstatt speichert bestätigte Änderungen als Entwurf in diesem Browser. Der öffentliche Zeitstrahl liest weiterhin die Dateien im Ordner <code>data/</code>. Lade deine Exporte herunter und ersetze dort die entsprechenden JSON-Dateien.</p>${data.warnings.length ? `<details class="notice"><summary>${data.warnings.length} fehlerhafte Datensätze wurden beim Laden ausgelassen.</summary>${data.warnings.map(esc).join('<br>')}</details>` : ''}<div class="admin-toolbar"><div class="admin-tabs" role="group" aria-label="Datensätze"><button type="button" class="button" data-mode="events" aria-pressed="true">Ereignisse</button><button type="button" class="button" data-mode="relationships" aria-pressed="false">Beziehungen</button></div><div class="admin-actions"><button type="button" class="button" id="export-events">Ereignisse exportieren ↓</button><button type="button" class="button" id="export-relationships">Beziehungen exportieren ↓</button><button type="button" class="button text" id="reset-draft">Entwurf verwerfen</button></div></div><div class="confirm-row" id="reset-confirmation" hidden><span>Alle gespeicherten Entwurfsänderungen verwerfen?</span><button class="button" id="confirm-reset">Ja, Originaldaten laden</button><button class="button text" id="cancel-reset">Abbrechen</button></div><p class="draft-status" id="draft-status" role="status">${esc(draftMessage || 'Die Originaldaten sind geladen. Du kannst einen Eintrag auswählen oder neu anlegen.')}</p><div class="admin-layout"><section class="admin-list"><div class="admin-list-head"><h2 id="list-title">Ereignisse</h2><button type="button" class="button" id="new-record">+ Neu</button></div><label class="sr-only" for="record-search">Datensätze suchen</label><input id="record-search" type="search" placeholder="Eintrag oder ID suchen …"><div class="records" id="records"></div></section><section class="admin-editor" id="editor" aria-label="Datensatz bearbeiten"></section></div>`;
    function validateAll(events = data.events, relationships = data.relationships) {
      return [...events.flatMap(event => validateEvent(event, events, data.vocabularies, data).map(error => `${event.id}: ${error}`)), ...relationships.flatMap(r => validateRelationship(r, relationships, events, data.vocabularies, data.sources).map(error => `${r.id}: ${error}`))];
    }
    function status(message, error = false) {
      $('#draft-status').textContent = message;
      $('#draft-status').classList.toggle('error', error);
    }
    function persist() {
      try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({ events: data.events, relationships: data.relationships }));
        status('Änderungen als Browser-Entwurf gespeichert. Für die Website bitte JSON exportieren und die Dateien in data/ ersetzen.');
      } catch { status('Der Entwurf bleibt für diese Sitzung erhalten. Browserspeicher ist nicht verfügbar — bitte jetzt JSON exportieren.', true); }
    }
    function canLeave() { return !formDirty || window.confirm('Deine Formularänderungen sind noch nicht im Entwurf gespeichert. Änderungen verwerfen?'); }
    function renderList() {
      const query = $('#record-search').value.toLocaleLowerCase('de');
      const records = data[mode].filter(item => `${item.id} ${item.title ?? relationshipTitle(item)}`.toLocaleLowerCase('de').includes(query));
      $('#list-title').textContent = `${mode === 'events' ? 'Ereignisse' : 'Beziehungen'} (${data[mode].length})`;
      $('#records').innerHTML = records.map(item => `<button type="button" class="record" data-id="${item.id}" aria-current="${item.id === selectedId}"><strong>${esc(item.title ?? relationshipTitle(item))}</strong><small>${esc(item.id)} · ${mode === 'events' ? `${esc(item.date_label)} · ${esc(labelFor(data.vocabularies.disciplines, item.primary_discipline))}` : `Stärke ${item.strength}/5 · ${esc(labelFor(data.vocabularies.confidence, item.confidence))}`}</small></button>`).join('') || '<p class="empty-state">Keine passenden Datensätze.</p>';
    }
    function relationshipTitle(relationship) {
      const name = id => data.events.find(event => event.id === id)?.title ?? id;
      return `${name(relationship.source_id)} → ${labelFor(data.vocabularies.relationship_types, relationship.relationship_type)} → ${name(relationship.target_id)}`;
    }
    function nextId(collection, prefix) {
      let next = Math.max(0, ...collection.map(item => Number(item.id.replace(/^\D+/, '')) || 0)) + 1;
      while (collection.some(item => item.id === `${prefix}${String(next).padStart(4, '0')}`)) next++;
      return `${prefix}${String(next).padStart(4, '0')}`;
    }
    function newEvent() { return { id: nextId(data.events, 'E'), title: '', entry_type: 'event', start_year: 1800, end_year: null, date_precision: 'exact', date_label: '', primary_discipline: 'politics_society', secondary_disciplines: [], subdisciplines: [], topics: [], geography: [], scope: 'continental', importance: 3, short_description: '', long_description: '', persons: [], institutions: [], source_ids: [], confidence: 'medium', notes: '' }; }
    function newRelationship() { return { id: nextId(data.relationships, 'R'), source_id: data.events[0]?.id ?? '', target_id: data.events[1]?.id ?? '', relationship_type: 'influenced', strength: 3, confidence: 'medium', description: '', start_year: null, end_year: null, geography: [], source_ids: [] }; }
    function input(record, key, label, type = 'text', options = '') {
      return `<label>${label}<input name="${key}" type="${type}" value="${esc(record[key] ?? '')}" ${options}></label>`;
    }
    function select(record, key, label, items, multiple = false) {
      const values = multiple ? record[key] : [record[key]];
      return `<label>${label}<select name="${key}" ${multiple ? 'multiple' : ''}>${items.map(item => `<option value="${esc(item.id)}" ${values.includes(item.id) ? 'selected' : ''}>${esc(item.label ?? item.name ?? item.title)}</option>`).join('')}</select>${multiple ? '<span class="field-note">Mehrfachauswahl: ⌘ / Strg gedrückt halten.</span>' : ''}</label>`;
    }
    function textarea(record, key, label) { return `<label class="full">${label}<textarea name="${key}">${esc(record[key])}</textarea></label>`; }
    function renderEditor(record) {
      selectedId = record.id;
      formDirty = false;
      const vocab = data.vocabularies;
      const editing = data[mode].some(item => item.id === record.id);
      const fields = mode === 'events' ? [
        input(record, 'title', 'Titel *', 'text', 'required'),
        select(record, 'entry_type', 'Eintragstyp', vocab.entry_types),
        input(record, 'start_year', 'Startjahr *', 'number', 'required step="1"'),
        input(record, 'end_year', 'Endjahr · leer für ein punktuelles Ereignis', 'number', 'step="1"'),
        select(record, 'date_precision', 'Zeitgenauigkeit', vocab.date_precisions),
        input(record, 'date_label', 'Angezeigter Zeitraum · z. B. ca. 1760–1900'),
        select(record, 'primary_discipline', 'Hauptdisziplin', vocab.disciplines),
        select(record, 'secondary_disciplines', 'Weitere Disziplinen', vocab.disciplines, true),
        select(record, 'subdisciplines', 'Unterdisziplinen', vocab.subdisciplines, true),
        select(record, 'topics', 'Themen', vocab.topics, true),
        input({ ...record, geography: record.geography.join(', ') }, 'geography', 'Geografie · durch Komma getrennt'),
        select(record, 'scope', 'Räumliche Reichweite', vocab.scopes),
        input(record, 'importance', 'Bedeutung · 1 bis 5', 'number', 'required min="1" max="5" step="1"'),
        select(record, 'confidence', 'Sicherheit der Einordnung', vocab.confidence),
        textarea(record, 'short_description', 'Kurzbeschreibung'),
        textarea(record, 'long_description', 'Ausführliche Beschreibung'),
        select(record, 'persons', 'Personen', data.persons, true),
        select(record, 'institutions', 'Institutionen', data.institutions, true),
        select(record, 'source_ids', 'Quellen', data.sources, true),
        textarea(record, 'notes', 'Redaktionelle Notizen'),
      ].join('') : [
        select(record, 'source_id', 'Ausgangsereignis', data.events),
        select(record, 'target_id', 'Zielereignis', data.events),
        select(record, 'relationship_type', 'Beziehungstyp', vocab.relationship_types),
        input(record, 'strength', 'Stärke · 1 bis 5', 'number', 'required min="1" max="5" step="1"'),
        select(record, 'confidence', 'Sicherheit der Interpretation', vocab.confidence),
        input(record, 'start_year', 'Startjahr der Beziehung · optional', 'number', 'step="1"'),
        input(record, 'end_year', 'Endjahr der Beziehung · optional', 'number', 'step="1"'),
        input({ ...record, geography: record.geography.join(', ') }, 'geography', 'Geografie · durch Komma getrennt'),
        select(record, 'source_ids', 'Quellen', data.sources, true),
        textarea(record, 'description', 'Beschreibung der Verbindung *'),
      ].join('');
      $('#editor').innerHTML = `<div class="editor-top"><h2>${editing ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h2><span class="id-display">${esc(record.id)}</span></div>${mode === 'relationships' ? `<p class="relationship-preview" id="relationship-preview">${esc(relationshipTitle(record))}</p><p class="help-copy">Lies die Beziehung als Satz: Ausgang → Beziehungstyp → Ziel. „Entstand als Reaktion auf“ und „entwickelte sich aus“ verweisen vom späteren Eintrag zurück auf seinen Bezugspunkt.</p>` : ''}<form id="editor-form" novalidate><div class="form-errors" id="form-errors" role="alert" tabindex="-1"></div><div class="form-grid">${fields}</div><div class="form-footer"><button type="submit" class="button primary">Im Entwurf speichern</button><span class="draft-indicator" id="form-state">${editing ? 'Gespeicherter Datensatz' : 'Noch nicht gespeichert'}</span></div></form>`;
      const form = $('#editor-form');
      form.addEventListener('input', () => { formDirty = true; $('#form-state').textContent = 'Ungespeicherte Formularänderungen'; });
      form.addEventListener('change', () => {
        formDirty = true;
        $('#form-state').textContent = 'Ungespeicherte Formularänderungen';
        if (mode === 'relationships') $('#relationship-preview').textContent = relationshipTitle({ source_id: form.elements.source_id.value, target_id: form.elements.target_id.value, relationship_type: form.elements.relationship_type.value });
      });
      form.addEventListener('submit', event => {
        event.preventDefault();
        const updated = { ...record };
        const arrays = ['secondary_disciplines', 'subdisciplines', 'topics', 'persons', 'institutions', 'source_ids'];
        for (const element of form.elements) {
          if (!element.name) continue;
          if (arrays.includes(element.name)) updated[element.name] = [...element.selectedOptions].map(option => option.value);
          else if (element.name === 'geography') updated.geography = element.value.split(',').map(s => s.trim()).filter(Boolean);
          else if (['start_year', 'end_year', 'importance', 'strength'].includes(element.name)) updated[element.name] = element.value === '' ? null : Number(element.value);
          else updated[element.name] = element.value.trim();
        }
        if (mode === 'events' && !updated.date_label && Number.isFinite(updated.start_year)) updated.date_label = `${updated.start_year}${updated.end_year !== null ? `–${updated.end_year}` : ''}`;
        const others = data[mode].filter(item => item.id !== updated.id);
        const errors = mode === 'events' ? validateEvent(updated, others, vocab, data) : validateRelationship(updated, others, data.events, vocab, data.sources);
        if (errors.length) {
          $('#form-errors').innerHTML = `<ul>${errors.map(error => `<li>${esc(error)}</li>`).join('')}</ul>`;
          $('#form-errors').focus();
          return;
        }
        const index = data[mode].findIndex(item => item.id === updated.id);
        if (index < 0) data[mode].push(updated); else data[mode][index] = updated;
        formDirty = false;
        persist();
        renderList();
        renderEditor(updated);
        $('#form-state').textContent = '✓ Im Browser-Entwurf gespeichert';
      });
      renderList();
    }
    $('#records').addEventListener('click', event => {
      const button = event.target.closest('[data-id]');
      if (button && canLeave()) renderEditor(data[mode].find(item => item.id === button.dataset.id));
    });
    $('#record-search').addEventListener('input', renderList);
    $('#new-record').addEventListener('click', () => { if (canLeave()) renderEditor(mode === 'events' ? newEvent() : newRelationship()); });
    $$('[data-mode]').forEach(button => button.addEventListener('click', () => {
      if (!canLeave()) return;
      mode = button.dataset.mode;
      $('#record-search').value = '';
      $$('[data-mode]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      renderEditor(data[mode][0] ?? (mode === 'events' ? newEvent() : newRelationship()));
    }));
    for (const collection of ['events', 'relationships']) {
      $(`#export-${collection}`).addEventListener('click', () => {
        if (formDirty) { status('Bitte speichere zuerst deine offenen Formularänderungen im Entwurf, bevor du exportierst.', true); return; }
        const errors = validateAll();
        if (errors.length) { status(`Export nicht möglich: ${errors.join(' ')}`, true); return; }
        downloadJSON(`${collection}.json`, data[collection]);
        status(`${collection}.json wurde zum Download bereitgestellt. Ersetze damit die entsprechende Datei im Ordner data/.`);
      });
    }
    $('#reset-draft').addEventListener('click', () => { $('#reset-confirmation').hidden = false; });
    $('#cancel-reset').addEventListener('click', () => { $('#reset-confirmation').hidden = true; });
    $('#confirm-reset').addEventListener('click', () => {
      data.events = structuredClone(originals.events);
      data.relationships = structuredClone(originals.relationships);
      let cleared = true;
      try { localStorage.removeItem(CONFIG.storageKey); } catch { cleared = false; }
      formDirty = false;
      $('#reset-confirmation').hidden = true;
      renderEditor(data[mode][0] ?? (mode === 'events' ? newEvent() : newRelationship()));
      status(cleared ? 'Der Browser-Entwurf wurde verworfen. Die Originaldateien sind wieder geladen.' : 'Originaldateien geladen. Der Browserspeicher konnte nicht geleert werden.', !cleared);
    });
    window.addEventListener('beforeunload', event => { if (formDirty) { event.preventDefault(); event.returnValue = ''; } });
    renderEditor(data.events[0] ?? newEvent());
  } catch (error) { console.error(error); showError(container, error); }
}

initAdmin();
