import { escapeHTML as esc } from './utils.js';

const columns = ['events', 'persons', 'institutions', 'relationships', 'sources'];
// Only project-relative paths may become links, including filenames with spaces.
function link(path, label) {
  if (typeof path !== 'string' || !path || /^(?:[a-z]+:|\/|\\)/i.test(path) || path.split(/[\\/]/).includes('..')) return esc(label);
  return `<a href="${esc(path.split('/').map(encodeURIComponent).join('/'))}">${esc(label)}</a>`;
}

export function historyRows(history) {
  if (!Array.isArray(history)) throw new Error('Invalid import history');
  // The importer prepends entries; retain that order for older undated imports.
  return history.map(entry => {
    if (!entry || typeof entry.title !== 'string' || !entry.counts || columns.some(key => !Number.isInteger(entry.counts[key]) || entry.counts[key] < 0)) throw new Error('Invalid import history entry');
    let date = 'Nicht protokolliert';
    if (entry.applied_at) {
      const value = new Date(entry.applied_at);
      if (!Number.isFinite(value.getTime())) throw new Error('Invalid import date');
      date = `<time datetime="${esc(entry.applied_at)}">${new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', ...(/T/.test(entry.applied_at) ? { timeStyle: 'short' } : {}), timeZone: 'Europe/Oslo' }).format(value)}</time>`;
    }
    return `<tr><th scope="row">${link(entry.import_file, entry.title)}</th><td>${date}</td>${columns.map(key => `<td>${entry.counts[key]}</td>`).join('')}<td>${entry.log ? link(entry.log, 'Importprotokoll') : 'Automatisch protokolliert'}</td></tr>`;
  }).join('') || '<tr><td colspan="8">Noch keine Importe protokolliert.</td></tr>';
}

const target = globalThis.document?.querySelector('#import-history-rows');
if (target) {
  try {
    const response = await fetch('data/import-history.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    target.innerHTML = historyRows(await response.json());
  } catch {
    target.innerHTML = '<tr><td colspan="8" role="alert">Der Importverlauf konnte nicht geladen werden. Bitte die Seite erneut laden.</td></tr>';
  }
}
