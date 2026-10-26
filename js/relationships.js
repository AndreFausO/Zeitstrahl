import { escapeHTML as esc, clamp, labelFor } from './utils.js';

export function selectedRelationships(data, eventId, minimumStrength) {
  return data.relationships.filter(r => (r.source_id === eventId || r.target_id === eventId) && r.strength >= minimumStrength)
    .sort((a, b) => b.strength - a.strength);
}

export function drawRelationships(svg, canvas, relationships, data) {
  svg.innerHTML = '<defs><marker id="relationship-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9" fill="none" stroke="#728768" stroke-width="1.5"/></marker></defs>';
  const canvasRect = canvas.getBoundingClientRect();
  const ns = 'http://www.w3.org/2000/svg';
  let shown = 0;
  relationships.forEach((relationship, index) => {
    const source = canvas.querySelector(`[data-event-id="${relationship.source_id}"]`);
    const target = canvas.querySelector(`[data-event-id="${relationship.target_id}"]`);
    if (!source || !target) return;
    const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
    const sameRow = Math.abs(a.top - b.top) < 15;
    const down = b.top > a.top;
    const x1 = a.left - canvasRect.left + Math.min(a.width / 2, 65);
    const x2 = b.left - canvasRect.left + Math.min(b.width / 2, 65);
    const y1 = (sameRow ? a.top : down ? a.bottom : a.top) - canvasRect.top;
    const y2 = (sameRow ? b.top : down ? b.top : b.bottom) - canvasRect.top;
    const bend = sameRow ? 20 + index % 3 * 6 : Math.max(24, Math.abs(y2 - y1) * .5);
    const path = document.createElementNS(ns, 'path');
    const type = data.vocabularies.relationship_types.find(type => type.id === relationship.relationship_type);
    path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${sameRow ? y1 - bend : y1 + (down ? bend : -bend)}, ${x2} ${sameRow ? y2 - bend : y2 + (down ? -bend : bend)}, ${x2} ${y2}`);
    path.setAttribute('class', `connection ${type.category}`);
    path.setAttribute('marker-end', 'url(#relationship-arrow)');
    path.setAttribute('tabindex', '0');
    path.setAttribute('role', 'img');
    path.dataset.relationshipId = relationship.id;
    const sourceEvent = data.events.find(event => event.id === relationship.source_id);
    const targetEvent = data.events.find(event => event.id === relationship.target_id);
    const label = `${sourceEvent.title} ${type.label} ${targetEvent.title}`;
    path.setAttribute('aria-label', `${label}. Stärke ${relationship.strength} von 5. ${relationship.description}`);
    const show = event => {
      const tooltip = document.querySelector('#relationship-tooltip');
      tooltip.innerHTML = `<strong>${esc(sourceEvent.title)} <span class="relation-label">${esc(type.label)}</span> ${esc(targetEvent.title)}</strong><p>${esc(relationship.description)}</p><small>Stärke ${relationship.strength}/5 · Sicherheit: ${esc(labelFor(data.vocabularies.confidence, relationship.confidence))}</small>`;
      tooltip.hidden = false;
      const rect = path.getBoundingClientRect();
      tooltip.style.left = `${clamp(event.clientX ?? rect.left, 10, Math.max(10, innerWidth - 310))}px`;
      tooltip.style.top = `${clamp((event.clientY ?? rect.top) + 15, 10, Math.max(10, innerHeight - tooltip.offsetHeight - 10))}px`;
    };
    const hide = () => { document.querySelector('#relationship-tooltip').hidden = true; };
    path.addEventListener('pointerenter', show);
    path.addEventListener('pointerleave', hide);
    path.addEventListener('focus', show);
    path.addEventListener('blur', hide);
    svg.append(path);
    shown++;
  });
  return shown;
}
