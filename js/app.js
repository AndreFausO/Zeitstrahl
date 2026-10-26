import { CONFIG } from './config.js';
import { loadData } from './data-loader.js';
import { $, $$, icon, escapeHTML as esc, endYear, showError } from './utils.js';
import { initialFilters, filterEvents, createFilters } from './filters.js';
import { Timeline } from './timeline.js';
import { renderDetailPanel } from './event-detail.js';

async function init() {
  const app = $('#app');
  try {
    const data = await loadData();
    data.domain = { start: Math.min(CONFIG.defaultStartYear, ...data.events.map(e => e.start_year)), end: Math.max(CONFIG.defaultEndYear, ...data.events.map(endYear)) };
    $('#data-stats').textContent = `${data.events.length} Einträge · ${data.relationships.length} Verbindungen · 6 Disziplinen`;
    $('#intro-years').innerHTML = `${data.domain.start} <span>—</span> ${data.domain.end}`;
    app.innerHTML = `${data.warnings.length ? `<details class="notice"><summary>${data.warnings.length} ungültige Datensätze wurden übersprungen.</summary>${data.warnings.map(esc).join('<br>')}</details>` : ''}<section class="explorer" aria-label="Geschichte erkunden"><div id="filters"></div><div class="view-toolbar"><div class="view-heading"><h2 id="visible-range">${data.domain.start} — ${data.domain.end}</h2><span class="count-badge" id="event-count" role="status"></span></div><div class="view-controls"><span class="zoom-note">DEINE PERSPEKTIVE</span><div class="zoom-control" role="group" aria-label="Zoomstufe">${CONFIG.zoomLevels.map((level, index) => `<button type="button" data-zoom="${index}" aria-pressed="${index === CONFIG.initialZoom}">${level.label}</button>`).join('')}</div><div class="pan-controls"><button type="button" class="icon-button" id="pan-left" aria-label="In frühere Jahre verschieben">←</button><button type="button" class="icon-button" id="pan-right" aria-label="In spätere Jahre verschieben">→</button></div></div></div><div class="workspace"><div class="timeline-main" id="timeline"></div><aside class="detail-panel" id="detail-panel" aria-label="Ereignisdetails" hidden></aside></div><div class="timeline-legend"><div class="legend-symbols"><span><i class="legend-dot"></i>Ereignis</span><span><i class="legend-bar"></i>Entwicklung / Zeitraum</span><span>↗ Verbindung</span></div><span class="hint">${icon('link')} Wähle einen Eintrag und entdecke seine Verbindungen.</span></div></section><section class="discover-strip" aria-labelledby="discovery-heading"><div><h3 id="discovery-heading">Ereignisse, die die Welt veränderten</h3><p>Wähle ein Ereignis und entdecke seine Verbindungen im Zeitstrahl.</p></div><ul class="discovery-list" id="discovery-list"></ul></section><div id="event-tooltip" class="event-tooltip" role="tooltip" hidden></div><div id="relationship-tooltip" class="relationship-tooltip" role="tooltip" hidden></div><p class="sr-only" id="selection-announcement" role="status"></p>`;
    const filters = initialFilters();
    let selectedId = null;
    const timeline = new Timeline($('#timeline'), data, selectEvent);
    const controls = createFilters($('#filters'), data, filters, refresh);
    const discoveries = [
      { id: 'E0001', label: 'Buchdruck' },
      { id: 'E0004', label: 'Reformation' },
      { id: 'E0006', label: 'Aufklärung' },
      { id: 'E0008', label: 'Französische Revolution' },
      { id: 'E0009', label: 'Industrialisierung' },
      { id: 'E0007', label: 'Erfindung der Dampfmaschine' },
      { id: 'E0025', label: 'Erster Weltkrieg' },
      { id: 'E0040', label: 'Zweiter Weltkrieg' },
    ];
    $('#discovery-list').innerHTML = discoveries.map(({ id, label }) => {
      const event = data.events.find(event => event.id === id);
      if (!event) return '';
      return `<li><button type="button" class="discovery-link" data-discover="${id}"><span class="discovery-date">${esc(event.date_label)}</span><span class="discovery-title">${esc(label)}</span><span class="discovery-arrow" aria-hidden="true">${icon('arrow')}</span></button></li>`;
    }).join('');
    function refresh() {
      const filtered = filterEvents(data.events, filters);
      if (selectedId && !filtered.some(event => event.id === selectedId)) {
        selectedId = null;
        renderDetailPanel($('#detail-panel'), null, data, selectEvent, closePanel);
      }
      timeline.update(filtered, filters, selectedId);
    }
    function selectEvent(id) {
      const event = data.events.find(e => e.id === id);
      if (!event) return;
      if (!filterEvents(data.events, filters).some(e => e.id === id)) {
        controls.reset();
        $('#selection-announcement').textContent = 'Filter zurückgesetzt, damit der gewählte Eintrag sichtbar ist.';
      }
      selectedId = id;
      renderDetailPanel($('#detail-panel'), event, data, selectEvent, closePanel);
      refresh();
      timeline.focusEvent(id, true);
      timeline.hideTooltips();
      const url = new URL(location.href);
      url.searchParams.set('event', id);
      history.replaceState(null, '', url);
      $('#selection-announcement').textContent = `${event.title} ausgewählt. Details und Verbindungen werden angezeigt.`;
    }
    function closePanel() {
      const previous = selectedId;
      selectedId = null;
      renderDetailPanel($('#detail-panel'), null, data, selectEvent, closePanel);
      refresh();
      const url = new URL(location.href);
      url.searchParams.delete('event');
      history.replaceState(null, '', url);
      const node = $(`[data-event-id="${previous}"]`);
      if (node) node.focus({ preventScroll: true });
      else timeline.viewport.focus();
      timeline.hideTooltips();
    }
    $$('[data-zoom]').forEach(button => button.addEventListener('click', () => {
      $$('[data-zoom]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      timeline.setZoom(Number(button.dataset.zoom));
    }));
    $('#pan-left').addEventListener('click', () => timeline.pan(-1));
    $('#pan-right').addEventListener('click', () => timeline.pan(1));
    $$('[data-discover]').forEach(button => button.addEventListener('click', () => {
      selectEvent(button.dataset.discover);
      $('.explorer').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('#explore-dialog').open) { timeline.hideTooltips(); if (selectedId) closePanel(); } });
    initNavigation(data, filters, controls, refresh);
    refresh();
    timeline.scrollToYear(CONFIG.initialFocusYear);
    const initialEvent = new URLSearchParams(location.search).get('event');
    if (initialEvent) selectEvent(initialEvent);
  } catch (error) { console.error(error); showError(app, error); }
}

function initNavigation(data, filters, controls, refresh) {
  const dialog = $('#explore-dialog');
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  $$('[data-nav]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.nav === 'search') { $('#event-search').focus(); return; }
    if (button.dataset.nav === 'topics') {
      $('#dialog-title').textContent = 'Ein Thema. Viele Perspektiven.';
      $('#dialog-content').innerHTML = `<p class="help-copy">Wähle ein Thema, um seine Spuren durch die Geschichte zu verfolgen.</p><div class="topic-grid">${data.vocabularies.topics.map(topic => `<button type="button" class="button" data-topic="${topic.id}">${esc(topic.label)} <span class="muted">${data.events.filter(e => e.topics.includes(topic.id)).length}</span></button>`).join('')}</div>`;
      $$('[data-topic]', dialog).forEach(button => button.addEventListener('click', () => { filters.topics = [button.dataset.topic]; controls.sync(); refresh(); dialog.close(); }));
    } else {
      $('#dialog-title').textContent = 'Menschen, die etwas bewegten.';
      $('#dialog-content').innerHTML = data.persons.map(person => `<article class="person-row"><h3>${esc(person.name)} <span class="muted">${person.birth_year}–${person.death_year ?? '…'}</span></h3><p>${esc(person.short_description)}</p><button type="button" class="button text" data-person="${person.id}">Einträge im Zeitstrahl ansehen ↗</button></article>`).join('');
      $$('[data-person]', dialog).forEach(button => button.addEventListener('click', () => { controls.reset(); filters.person = button.dataset.person; controls.sync(); refresh(); dialog.close(); }));
    }
    dialog.showModal();
  }));
}

init();
