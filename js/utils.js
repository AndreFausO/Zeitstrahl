export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const labelFor = (items, id) => items.find(item => item.id === id)?.label ?? id;
export const endYear = event => event.end_year ?? event.start_year;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const formatYear = year => year < 0 ? `${Math.abs(Math.round(year))} v. Chr.` : String(Math.round(year));
export const derivedValues = (event, relationships = []) => ({
  duration: endYear(event) - event.start_year,
  century: Math.ceil(event.start_year / 100),
  is_point_event: event.end_year === null || event.end_year === event.start_year,
  relationship_count: relationships.filter(r => r.source_id === event.id || r.target_id === event.id).length,
});

export function simultaneousEvents(selected, events) {
  const sharedRegion = event => event.geography.some(region => selected.geography.includes(region));
  return events.filter(event => event.id !== selected.id && event.start_year <= endYear(selected) && endYear(event) >= selected.start_year)
    .sort((a, b) => Number(b.primary_discipline !== selected.primary_discipline) - Number(a.primary_discipline !== selected.primary_discipline)
      || b.importance - a.importance || Number(sharedRegion(b)) - Number(sharedRegion(a)) || a.start_year - b.start_year);
}

export function downloadJSON(filename, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }));
  const anchor = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const icons = {
  politics_society: '<path d="m3 8 9-5 9 5M4 9h16M6 10v8m6-8v8m6-8v8M3 21h18M4 18h16"/>',
  science: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(55 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-55 12 12)"/>',
  technology_economy: '<path d="M3 21V10l6 3V7l6 3V3h5v18ZM6 17h1m4 0h1m4 0h1"/>',
  philosophy_religion: '<path d="M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
  art_culture: '<path d="M12 3a9 9 0 1 0 0 18c4 0 1-4 4-5h2c5-1 4-13-6-13Z"/><circle cx="7" cy="11" r=".7"/><circle cx="10" cy="7" r=".7"/><circle cx="15" cy="7" r=".7"/><circle cx="18" cy="11" r=".7"/>',
  environment_nature: '<path d="M20 3C7 2 2 8 5 15s15 3 15-12ZM4 21 16 8M9 15l-1-5m5 1h5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  link: '<path d="m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
};
export const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.link}</svg>`;

export function showError(container, error) {
  container.innerHTML = `<div class="error-state" role="alert"><h2>Die Daten konnten nicht geladen werden.</h2><p>${escapeHTML(error.message)}</p><p>Bitte starte die Website über einen lokalen Webserver, zum Beispiel mit VS Code Live Server, und lade die Seite erneut.</p><button class="button" onclick="location.reload()">Erneut versuchen</button></div>`;
}
