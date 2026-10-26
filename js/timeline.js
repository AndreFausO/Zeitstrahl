import { CONFIG } from './config.js';
import { $, escapeHTML as esc, icon, clamp, endYear, labelFor } from './utils.js';
import { selectedRelationships, drawRelationships } from './relationships.js';

export class Timeline {
  constructor(container, data, onSelect) {
    this.data = data;
    this.onSelect = onSelect;
    this.zoom = CONFIG.initialZoom;
    this.customSpan = null;
    this.minimapDrag = null;
    this.events = data.events;
    this.start = data.domain.start;
    this.end = data.domain.end;
    this.selectedId = null;
    container.innerHTML = `<div class="timeline-viewport" tabindex="0" role="region" aria-label="Interaktiver Zeitstrahl. Mit den Pfeiltasten horizontal navigieren."><div class="timeline-canvas"></div></div><div class="timeline-bottom"><div class="minimap-header"><span>Der gesamte Zeitstrahl</span><span>Ränder ziehen: Zeitraum anpassen · Mitte ziehen: verschieben</span></div><div class="minimap" role="group" aria-label="Sichtbaren Zeitraum anpassen"><div class="mini-marks" aria-hidden="true"></div><div class="mini-window"><button type="button" class="mini-handle mini-handle-start" data-edge="start" role="slider" aria-label="Beginn des sichtbaren Zeitraums" aria-orientation="horizontal"></button><div class="mini-pan" role="slider" tabindex="0" aria-label="Sichtbaren Zeitraum verschieben" aria-orientation="horizontal"></div><button type="button" class="mini-handle mini-handle-end" data-edge="end" role="slider" aria-label="Ende des sichtbaren Zeitraums" aria-orientation="horizontal"></button></div></div><div class="mini-years"></div></div>`;
    this.viewport = $('.timeline-viewport', container);
    this.canvas = $('.timeline-canvas', container);
    this.minimap = $('.minimap', container);
    this.viewport.addEventListener('scroll', () => {
      if (this.customSpan !== null) this.viewport.scrollLeft = Math.min(this.viewport.scrollLeft, Math.max(0, this.plotWidth - (this.viewport.clientWidth - this.labelWidth)));
      this.updateMinimap(); this.updateProcessLabels(); this.hideTooltips();
    });
    this.viewport.addEventListener('keydown', event => {
      if (event.target !== this.viewport || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') this.viewport.scrollLeft = 0;
      else if (event.key === 'End') this.viewport.scrollLeft = this.viewport.scrollWidth;
      else this.pan(event.key === 'ArrowLeft' ? -1 : 1);
    });
    this.canvas.addEventListener('click', event => {
      const node = event.target.closest('[data-event-id]');
      if (node) { this.hideTooltips(); this.onSelect(node.dataset.eventId); }
    });
    this.minimap.addEventListener('pointerdown', event => {
      if (event.button !== 0 || this.minimapDrag) return;
      event.preventDefault();
      const handle = event.target.closest('[data-edge]');
      const inside = event.target.closest('.mini-window');
      const mode = handle?.dataset.edge ?? (inside ? 'pan' : 'navigate');
      if (mode === 'navigate') this.navigateMinimap(event.clientX);
      this.minimapDrag = { mode, pointerId: event.pointerId, clientX: event.clientX, ...this.visibleRange(), width: this.minimap.clientWidth };
      this.minimap.setPointerCapture(event.pointerId);
      (handle ?? $('.mini-pan', this.minimap)).focus({ preventScroll: true });
      this.minimap.classList.add('is-dragging');
    });
    this.minimap.addEventListener('pointermove', event => {
      const drag = this.minimapDrag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const delta = (event.clientX - drag.clientX) / drag.width * (this.data.domain.end - this.data.domain.start);
      if (drag.mode === 'start') this.setVisibleRange(clamp(drag.start + delta, this.start, drag.end - this.minimumSpan()), drag.end);
      else if (drag.mode === 'end') this.setVisibleRange(drag.start, clamp(drag.end + delta, drag.start + this.minimumSpan(), this.end));
      else if (drag.mode === 'pan') {
        const start = clamp(drag.start + delta, this.start, this.end - (drag.end - drag.start));
        this.scrollToYear(start + (drag.end - drag.start) / 2);
      } else this.navigateMinimap(event.clientX);
    });
    const endDrag = event => {
      if (this.minimapDrag?.pointerId !== event.pointerId) return;
      this.minimapDrag = null;
      this.minimap.classList.remove('is-dragging');
      if (this.minimap.hasPointerCapture(event.pointerId)) this.minimap.releasePointerCapture(event.pointerId);
    };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => this.minimap.addEventListener(type, endDrag));
    this.minimap.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const edge = event.target.dataset.edge;
      if (edge) {
        const range = this.visibleRange();
        const minimum = edge === 'start' ? this.start : range.start + this.minimumSpan();
        const maximum = edge === 'start' ? range.end - this.minimumSpan() : this.end;
        const step = Math.max(1, (this.end - this.start) / 100) * (event.shiftKey ? 10 : 1);
        const value = event.key === 'Home' ? minimum : event.key === 'End' ? maximum : range[edge] + (['ArrowLeft', 'ArrowDown'].includes(event.key) ? -step : step);
        range[edge] = clamp(value, minimum, maximum);
        this.setVisibleRange(range.start, range.end);
      } else if (event.key === 'Home') this.viewport.scrollLeft = 0;
      else if (event.key === 'End') this.viewport.scrollLeft = this.viewport.scrollWidth;
      else this.pan(['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 1);
    });
    this.resizeObserver = new ResizeObserver(() => {
      const width = this.viewport.clientWidth;
      if (this.lastWidth !== width && width) {
        const center = this.visibleCenter();
        this.render();
        this.scrollToYear(center);
      }
    });
    this.resizeObserver.observe(this.viewport);
  }

  update(events, filters, selectedId) {
    const oldCenter = this.visibleCenter();
    const start = filters.start ?? this.data.domain.start;
    const end = filters.end ?? this.data.domain.end;
    const changedRange = this.start !== start || this.end !== end;
    if (changedRange) this.customSpan = null;
    this.start = start;
    this.end = end;
    this.events = events;
    this.selectedId = selectedId;
    this.render();
    this.scrollToYear(changedRange ? (start + end) / 2 : oldCenter);
  }

  render() {
    this.hideTooltips();
    this.canvas.classList.toggle('has-selection', Boolean(this.selectedId));
    this.lastWidth = this.viewport.clientWidth;
    this.labelWidth = innerWidth <= 600 ? 148 : CONFIG.labelWidth;
    const visibleWidth = Math.max(220, this.viewport.clientWidth - this.labelWidth);
    const paddingEnd = CONFIG.cardWidth + 20;
    this.plotWidth = this.customSpan !== null ? (this.viewport.clientWidth - this.labelWidth) * (this.end - this.start) / this.customSpan : this.zoom === 0 ? Math.max(220, visibleWidth - paddingEnd) : visibleWidth * CONFIG.zoomLevels[this.zoom].scale;
    this.pixelsPerYear = this.plotWidth / (this.end - this.start);
    this.canvas.style.width = `${this.plotWidth + this.labelWidth + paddingEnd}px`;
    const relationships = this.selectedId ? selectedRelationships(this.data, this.selectedId, CONFIG.zoomLevels[this.zoom].strength) : [];
    const connected = new Set(relationships.flatMap(r => [r.source_id, r.target_id]));
    this.visibleEvents = this.events.filter(event => event.importance >= CONFIG.zoomLevels[this.zoom].importance || event.id === this.selectedId || connected.has(event.id));
    const step = this.pixelsPerYear > 10 ? 10 : this.pixelsPerYear > 4 ? 25 : 50;
    const years = [];
    for (let year = Math.ceil(this.start / step) * step; year <= this.end; year += step) years.push(year);
    this.canvas.innerHTML = `<div class="time-axis"><span class="axis-title">DISZIPLINEN <span style="margin-left:7px">↓</span></span>${years.map(year => `<span class="axis-year" style="left:${this.x(year)}px">${year}</span>`).join('')}</div>${years.map(year => `<div class="grid-line" style="left:${this.x(year)}px"></div>`).join('')}`;
    this.data.vocabularies.disciplines.forEach(discipline => {
      const events = this.visibleEvents.filter(event => event.primary_discipline === discipline.id).sort((a, b) => a.start_year - b.start_year || endYear(b) - endYear(a));
      const rowEnds = [];
      const positions = events.map(event => {
        const start = Math.max(event.start_year, this.start);
        const x = this.x(start);
        const isProcess = event.end_year !== null && event.end_year !== event.start_year;
        const rangeWidth = isProcess ? Math.max(3, (Math.min(endYear(event), this.end) - start) * this.pixelsPerYear) : 0;
        const width = Math.max(CONFIG.cardWidth, rangeWidth);
        let row = rowEnds.findIndex(end => end + 18 < x);
        if (row === -1) row = rowEnds.length;
        rowEnds[row] = x + width;
        return { event, x, row, width, rangeWidth, isProcess };
      });
      const lane = document.createElement('section');
      lane.className = 'timeline-lane';
      lane.setAttribute('aria-label', discipline.label);
      lane.style.cssText = `--discipline:${discipline.color};--tint:${discipline.tint};height:${Math.max(91, rowEnds.length * CONFIG.rowHeight + 27)}px`;
      lane.innerHTML = `<div class="lane-label"><span class="lane-icon">${icon(discipline.id)}</span><span class="lane-name">${esc(discipline.label)}<span class="lane-count">${events.length} ${events.length === 1 ? 'Eintrag' : 'Einträge'}</span></span></div>`;
      positions.forEach(({ event, x, row, width, rangeWidth, isProcess }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `event-node ${isProcess ? 'process' : 'point'}${event.id === this.selectedId ? ' is-selected' : this.selectedId ? connected.has(event.id) ? ' is-related' : ' is-muted' : ''}`;
        button.dataset.eventId = event.id;
        button.setAttribute('aria-pressed', String(event.id === this.selectedId));
        button.setAttribute('aria-label', `${event.title}, ${event.date_label}. ${discipline.label}. Details anzeigen.`);
        button.style.cssText = `left:${x}px;top:${15 + row * CONFIG.rowHeight}px;width:${width}px;--range-width:${rangeWidth}px`;
        button.innerHTML = `${isProcess ? '<span class="process-span" aria-hidden="true"></span>' : ''}<span class="event-title">${esc(event.title)}</span><span class="event-date">${esc(event.date_label)}</span>${event.start_year < this.start ? '<span class="clipped-start" aria-hidden="true"></span>' : ''}${endYear(event) > this.end ? '<span class="clipped-end" aria-hidden="true"></span>' : ''}`;
        button.addEventListener('pointerenter', e => this.showEventTooltip(event, button, e));
        button.addEventListener('pointerleave', () => this.hideTooltips());
        button.addEventListener('focus', () => this.showEventTooltip(event, button));
        button.addEventListener('blur', () => this.hideTooltips());
        lane.append(button);
      });
      this.canvas.append(lane);
    });
    if (!this.visibleEvents.length) {
      const message = document.createElement('div');
      message.className = 'no-events';
      message.textContent = 'Keine passenden Einträge. Passe deine Filter an oder wähle „Im Detail“.';
      this.canvas.prepend(message);
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('connections');
    svg.setAttribute('width', String(this.canvas.offsetWidth));
    svg.setAttribute('height', String(this.canvas.offsetHeight));
    svg.setAttribute('aria-label', 'Historische Beziehungen des ausgewählten Eintrags');
    this.canvas.append(svg);
    const shown = drawRelationships(svg, this.canvas, relationships, this.data);
    const status = $('#connection-status');
    if (status) status.textContent = `${shown} Verbindungslinien in dieser Ansicht. Zoom und Filter bestimmen, welche Verbindungen sichtbar sind.`;
    const count = $('#event-count');
    if (count) count.textContent = `${this.visibleEvents.length} von ${this.data.events.length} Einträgen`;
    this.renderMinimap();
    this.updateMinimap();
    this.updateProcessLabels();
  }

  x(year) { return this.labelWidth + (year - this.start) * this.pixelsPerYear; }
  visibleCenter() {
    if (!this.pixelsPerYear) return CONFIG.initialFocusYear;
    return this.start + (this.viewport.scrollLeft + Math.max(220, (this.lastWidth || this.viewport.clientWidth) - this.labelWidth) / 2) / this.pixelsPerYear;
  }
  scrollToYear(year) {
    const visibleYears = (this.viewport.clientWidth - this.labelWidth) / this.pixelsPerYear;
    const start = clamp(year - visibleYears / 2, this.start, Math.max(this.start, this.end - visibleYears));
    this.viewport.scrollLeft = (start - this.start) * this.pixelsPerYear;
    this.updateMinimap();
    this.updateProcessLabels();
  }
  focusEvent(id, keyboard = false) {
    const event = this.data.events.find(e => e.id === id);
    if (!event) return;
    const visibleYears = (this.viewport.clientWidth - this.labelWidth) / this.pixelsPerYear;
    this.scrollToYear(clamp(event.start_year + visibleYears * .18, this.start, this.end));
    const node = this.canvas.querySelector(`[data-event-id="${id}"]`);
    if (node) {
      const top = node.parentElement.offsetTop + node.offsetTop;
      if (top < this.viewport.scrollTop + 50 || top + 50 > this.viewport.scrollTop + this.viewport.clientHeight) this.viewport.scrollTop = Math.max(0, top - this.viewport.clientHeight / 2);
      if (keyboard) node.focus({ preventScroll: true });
    }
  }
  setZoom(level) {
    const center = this.visibleCenter();
    this.zoom = clamp(level, 0, CONFIG.zoomLevels.length - 1);
    this.customSpan = null;
    this.render();
    this.scrollToYear(center);
  }
  pan(direction) { this.viewport.scrollLeft += direction * (this.viewport.clientWidth - this.labelWidth) * .55; }

  updateProcessLabels() {
    // Long processes remain identifiable when their start is outside the viewport.
    this.canvas.querySelectorAll('.event-node.process').forEach(node => {
      const offset = clamp(this.viewport.scrollLeft + this.labelWidth - parseFloat(node.style.left), 0, Math.max(0, node.offsetWidth - CONFIG.cardWidth));
      node.querySelectorAll('.event-title, .event-date').forEach(label => {
        label.style.transform = `translateX(${offset}px)`;
        label.style.maxWidth = `${node.offsetWidth - offset - 18}px`;
      });
    });
  }

  renderMinimap() {
    const span = this.data.domain.end - this.data.domain.start;
    $('.mini-marks', this.minimap).innerHTML = this.data.events.map(event => {
      const discipline = this.data.vocabularies.disciplines.find(d => d.id === event.primary_discipline);
      const lane = this.data.vocabularies.disciplines.indexOf(discipline);
      return `<span class="mini-mark" style="--discipline:${discipline.color};left:${(event.start_year - this.data.domain.start) / span * 100}%;width:${Math.max(.25, (endYear(event) - event.start_year) / span * 100)}%;top:${3 + lane * 5}px"></span>`;
    }).join('');
    $('.mini-years').innerHTML = `<span>${this.data.domain.start}</span><span>${Math.round((this.data.domain.start + this.data.domain.end) / 2)}</span><span>${this.data.domain.end}</span>`;
  }
  updateMinimap() {
    if (!this.pixelsPerYear) return;
    const { start: visibleStart, end: visibleEnd } = this.visibleRange();
    const span = this.data.domain.end - this.data.domain.start;
    const window = $('.mini-window', this.minimap);
    window.style.left = `${clamp((visibleStart - this.data.domain.start) / span * 100, 0, 100)}%`;
    window.style.width = `${clamp((Math.min(visibleEnd, this.data.domain.end) - Math.max(visibleStart, this.data.domain.start)) / span * 100, 0, 100)}%`;
    const pan = $('.mini-pan', this.minimap);
    pan.setAttribute('aria-valuemin', String(this.start));
    pan.setAttribute('aria-valuemax', String(this.end));
    pan.setAttribute('aria-valuenow', String(Math.round(visibleStart)));
    pan.setAttribute('aria-valuetext', `${Math.round(visibleStart)} bis ${Math.round(visibleEnd)}`);
    this.minimap.querySelectorAll('[data-edge]').forEach(handle => {
      const isStart = handle.dataset.edge === 'start';
      handle.setAttribute('aria-valuemin', String(isStart ? this.start : visibleStart + this.minimumSpan()));
      handle.setAttribute('aria-valuemax', String(isStart ? visibleEnd - this.minimumSpan() : this.end));
      handle.setAttribute('aria-valuenow', String(isStart ? visibleStart : visibleEnd));
      handle.setAttribute('aria-valuetext', String(Math.round(isStart ? visibleStart : visibleEnd)));
    });
    const range = $('#visible-range');
    if (range) range.textContent = `${Math.round(visibleStart)} — ${Math.round(visibleEnd)}`;
  }
  minimumSpan() {
    return Math.min(this.end - this.start, Math.max(10, (this.data.domain.end - this.data.domain.start) * 24 / this.minimap.clientWidth));
  }
  visibleRange() {
    return {
      start: clamp(this.start + this.viewport.scrollLeft / this.pixelsPerYear, this.start, this.end),
      end: clamp(this.start + (this.viewport.scrollLeft + this.viewport.clientWidth - this.labelWidth) / this.pixelsPerYear, this.start, this.end),
    };
  }
  setVisibleRange(start, end) {
    this.customSpan = end - start;
    this.render();
    this.scrollToYear((start + end) / 2);
    document.querySelectorAll('[data-zoom]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  }
  navigateMinimap(clientX) {
    const rect = this.minimap.getBoundingClientRect();
    const year = this.data.domain.start + clamp((clientX - rect.left) / rect.width, 0, 1) * (this.data.domain.end - this.data.domain.start);
    this.scrollToYear(year);
  }
  showEventTooltip(event, button, pointer) {
    if (this.selectedId) return;
    const tooltip = $('#event-tooltip');
    if (!tooltip) return;
    tooltip.innerHTML = `<strong>${esc(event.title)}</strong><small>${esc(labelFor(this.data.vocabularies.entry_types, event.entry_type))} · ${esc(event.date_label)}</small><p>${esc(event.short_description)}</p><div class="chip-row">${event.topics.slice(0, 4).map(topic => `<span class="chip">${esc(labelFor(this.data.vocabularies.topics, topic))}</span>`).join('')}</div>`;
    tooltip.hidden = false;
    const rect = button.getBoundingClientRect();
    tooltip.style.left = `${clamp(pointer?.clientX ?? rect.left, 10, Math.max(10, innerWidth - 310))}px`;
    tooltip.style.top = `${clamp(rect.bottom + 9, 10, Math.max(10, innerHeight - tooltip.offsetHeight - 10))}px`;
  }
  hideTooltips() { ['#event-tooltip', '#relationship-tooltip'].forEach(selector => { const tooltip = $(selector); if (tooltip) tooltip.hidden = true; }); }
}
