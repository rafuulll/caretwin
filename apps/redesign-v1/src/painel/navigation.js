const views = new Set(['overview', 'steps', 'sleep', 'alerts', 'family', 'settings']);
const persons = new Set(['antonio', 'maria']);

export function readPanelLocation() {
  const query = new URLSearchParams(window.location.search);
  return {view: views.has(query.get('view')) ? query.get('view') : 'overview', person: persons.has(query.get('person')) ? query.get('person') : 'antonio'};
}

export function panelHref(view, person = 'antonio') {
  const url = new URL(window.location.href);
  url.pathname = '/painel/';
  url.hash = '';
  if (view === 'overview') url.searchParams.delete('view'); else url.searchParams.set('view', view);
  if (person === 'antonio') url.searchParams.delete('person'); else url.searchParams.set('person', person);
  return url.pathname + url.search;
}

export function isPlainClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
