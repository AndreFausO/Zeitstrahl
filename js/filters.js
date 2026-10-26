import { $, $$, escapeHTML as esc, icon, endYear } from './utils.js';

export const initialFilters = () => ({ disciplines: [], topics: [], subdisciplines: [], query: '', start: null, end: null, importance: 1, person: null });

export function filterEvents(events, filters) {
  const query = filters.query.trim().toLocaleLowerCase('de');
  return events.filter(event => (!filters.disciplines.length || filters.disciplines.includes(event.primary_discipline))
    && (!filters.topics.length || event.topics.some(topic => filters.topics.includes(topic)))
    && (!filters.subdisciplines.length || event.subdisciplines.some(sub => filters.subdisciplines.includes(sub)))
    && (filters.start === null || endYear(event) >= filters.start)
    && (filters.end === null || event.start_year <= filters.end)
    && event.importance >= filters.importance
    && (!filters.person || event.persons.includes(filters.person))
    && (!query || `${event.title} ${event.short_description}`.toLocaleLowerCase('de').includes(query)));
}

export function createFilters(container, data, state, onChange) {
  const vocab = data.vocabularies;
  const dropdown = (key, title, items) => `<details class="filter-dropdown" data-filter="${key}"><summary>${title}<span class="selection-count"></span>${icon('chevron')}</summary><div class="filter-menu">${items.map(item => `<label><input type="checkbox" name="${key}" value="${esc(item.id)}">${esc(item.label)}</label>`).join('')}</div></details>`;
  container.innerHTML = `<div class="filter-bar"><span class="filter-label">DEIN BLICK</span>
    ${dropdown('disciplines', 'Disziplinen', vocab.disciplines)}${dropdown('topics', 'Themen', vocab.topics)}
    <details class="filter-dropdown" data-filter="period"><summary>Zeitraum${icon('chevron')}</summary><form class="filter-menu" id="period-form"><div class="years-inputs"><label>Von<input name="start" type="number" step="1" placeholder="${data.domain.start}"></label><label>Bis<input name="end" type="number" step="1" placeholder="${data.domain.end}"></label></div><p class="filter-error" role="alert"></p><button class="button primary" type="submit">Zeitraum anwenden</button></form></details>
    ${dropdown('subdisciplines', 'Fachgebiete', vocab.subdisciplines)}
    <details class="filter-dropdown"><summary>Mehr${icon('chevron')}</summary><div class="filter-menu"><label for="importance-filter">Bedeutung mindestens</label><select id="importance-filter"><option value="1">Alle Einträge</option><option value="2">2 — Ergänzend</option><option value="3">3 — Relevant</option><option value="4">4 — Bedeutend</option><option value="5">5 — Prägend</option></select><p class="help-copy">Die Zoomstufe begrenzt zusätzlich die sichtbaren Einträge.</p></div></details>
    <label class="search-field"><span class="sr-only">Ereignisse durchsuchen</span>${icon('search')}<input id="event-search" type="search" placeholder="Geschichte durchsuchen …" autocomplete="off"></label>
    <button type="button" class="reset-filters" id="reset-filters" hidden>Zurücksetzen</button></div><div class="active-filters" aria-label="Aktive Filter"></div>`;
  const changed = () => { sync(); onChange(); };
  container.addEventListener('change', event => {
    if (event.target.type === 'checkbox') {
      const key = event.target.name;
      state[key] = $$(`input[name="${key}"]:checked`, container).map(input => input.value);
      changed();
    }
  });
  $('#importance-filter', container).addEventListener('change', event => { state.importance = Number(event.target.value); changed(); });
  let timeout;
  $('#event-search', container).addEventListener('input', event => {
    clearTimeout(timeout);
    const value = event.target.value;
    timeout = setTimeout(() => { state.query = value; changed(); }, 100);
  });
  $('#period-form', container).addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const start = form.elements.start.value === '' ? null : Number(form.elements.start.value);
    const end = form.elements.end.value === '' ? null : Number(form.elements.end.value);
    if ((start ?? data.domain.start) >= (end ?? data.domain.end)) {
      $('.filter-error', form).textContent = 'Das Endjahr muss nach dem Startjahr liegen.';
      return;
    }
    $('.filter-error', form).textContent = '';
    Object.assign(state, { start, end });
    form.closest('details').open = false;
    changed();
  });
  $('#reset-filters', container).addEventListener('click', () => {
    clearTimeout(timeout);
    Object.assign(state, initialFilters());
    $('#event-search', container).value = '';
    $('#period-form', container).reset();
    $('#importance-filter', container).value = '1';
    changed();
  });
  $$('.filter-dropdown', container).forEach(details => details.addEventListener('toggle', () => {
    if (details.open) $$('.filter-dropdown', container).filter(other => other !== details).forEach(other => { other.open = false; });
  }));
  document.addEventListener('click', event => {
    $$('.filter-dropdown[open]', container).forEach(details => { if (!details.contains(event.target)) details.open = false; });
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') $$('.filter-dropdown[open]', container).forEach(details => { details.open = false; details.querySelector('summary').focus(); }); });
  $('.active-filters', container).addEventListener('click', event => {
    const button = event.target.closest('button[data-remove]');
    if (!button) return;
    state[button.dataset.remove] = state[button.dataset.remove].filter(id => id !== button.dataset.id);
    changed();
  });
  function sync() {
    for (const key of ['disciplines', 'topics', 'subdisciplines']) {
      $$(`input[name="${key}"]`, container).forEach(input => { input.checked = state[key].includes(input.value); });
      $(`[data-filter="${key}"] .selection-count`, container).textContent = state[key].length || '';
    }
    $('.active-filters', container).innerHTML = ['disciplines', 'topics', 'subdisciplines'].flatMap(key => state[key].map(id => `<button type="button" data-remove="${key}" data-id="${esc(id)}" aria-label="Filter ${esc(vocab[key].find(item => item.id === id)?.label)} entfernen">${esc(vocab[key].find(item => item.id === id)?.label)} <span aria-hidden="true">×</span></button>`)).join('')
      + (state.person ? `<span class="chip">Person: ${esc(data.persons.find(p => p.id === state.person)?.name)}</span>` : '');
    $('#reset-filters', container).hidden = !Object.entries(state).some(([key, value]) => Array.isArray(value) ? value.length : key === 'importance' ? value !== 1 : Boolean(value));
  }
  return { sync, reset: () => $('#reset-filters', container).click() };
}
