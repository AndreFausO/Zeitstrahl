export const CONFIG = Object.freeze({
  defaultStartYear: 1450,
  defaultEndYear: 1950,
  initialFocusYear: 1820,
  zoomLevels: [
    { label: 'Überblick', scale: 1, importance: 4, strength: 5 },
    { label: 'Entdecken', scale: 2.5, importance: 3, strength: 4 },
    { label: 'Im Detail', scale: 5, importance: 1, strength: 2 },
  ],
  initialZoom: 1,
  animationDuration: 180,
  labelWidth: 188,
  cardWidth: 136,
  rowHeight: 42,
  storageKey: 'zeitstrahl-draft-v1',
});
