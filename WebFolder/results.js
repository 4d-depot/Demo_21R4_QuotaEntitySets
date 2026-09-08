const params = new URLSearchParams(window.location.search);
const apiUrl = sessionStorage.getItem('apiUrl') || params.get('apiUrl');
const queryPreview = document.getElementById('query-preview');
const loadingEl = document.getElementById('state-loading');
const errorPanel = document.getElementById('error-panel');
const errorMessage = document.getElementById('error-message');
const resultsContainer = document.getElementById('results-container');
const loadMoreStatus = document.getElementById('load-more-status');
const loadMoreSentinel = document.getElementById('load-more-sentinel');
const rawResponse = document.getElementById('raw-response');
const infoBar = document.getElementById('info-bar');
const resultCount = document.getElementById('result-count');
const entitySet = document.getElementById('entity-set');
const pageSize = 50;
let offset = 0;
let hasMoreResults = true;
let isLoading = false;
let table;
let tableBody;
let columns = [];

function showError(message) {
  loadingEl.hidden = true;
  errorMessage.textContent = message;
  errorPanel.hidden = false;
}

function getEntities(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.__ENTITIES)) return payload.__ENTITIES;
  if (payload && Array.isArray(payload.entities)) return payload.entities;
  return null;
}

function getEntitySet(payload) {
  if (!payload || Array.isArray(payload)) return '-';
  return payload.__ENTITYSET || payload.entitySet || payload.__entitySet || '-';
}

function renderTable(entities) {
  if (entities.length === 0) {
    if (!table) resultsContainer.textContent = 'No results found.';
    resultsContainer.hidden = false;
    return;
  }

  const nextColumns = [...new Set([...columns, ...entities.flatMap((entity) => Object.keys(entity))])];
  if (!table) {
    table = document.createElement('table');
    table.className = 'results';
    table.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';
    tableBody = table.querySelector('tbody');
    resultsContainer.appendChild(table);
  }

  if (nextColumns.length !== columns.length) {
    const headerRow = table.querySelector('thead tr');
    headerRow.innerHTML = '';
    nextColumns.forEach((column) => {
      const cell = document.createElement('th');
      cell.textContent = column;
      headerRow.appendChild(cell);
    });
    columns = nextColumns;
  }

  entities.forEach((entity) => {
    const row = document.createElement('tr');
    columns.forEach((column) => {
      const cell = document.createElement('td');
      const value = entity[column];
      cell.textContent = value === null || value === undefined
        ? ''
        : typeof value === 'object' ? JSON.stringify(value) : String(value);
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });
  resultsContainer.hidden = false;
}

function pageUrl() {
  const separator = apiUrl.includes('?') ? '&' : '?';
  return `${apiUrl}${separator}$top=${pageSize}&$skip=${offset}`;
}

async function loadResults() {
  if (!apiUrl) {
    showError('No REST query was provided. Return to the search page and try again.');
    return;
  }

  queryPreview.textContent = apiUrl;

  if (isLoading || !hasMoreResults) return;
  isLoading = true;
  loadMoreStatus.hidden = offset === 0;

  try {
    const response = await fetch(pageUrl(), { headers: { Accept: 'application/json' } });
    const responseText = await response.text();
    let payload;

    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch {
      throw new Error(`The REST server returned invalid JSON (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      const detail = payload && (payload.__ERROR || payload.error || payload.message);
      throw new Error(detail ? String(detail) : `HTTP ${response.status}`);
    }

    const entities = getEntities(payload);
    loadingEl.hidden = true;
    infoBar.hidden = false;
    resultCount.textContent = entities ? offset + entities.length : '-';
    entitySet.textContent = getEntitySet(payload);

    if (entities) {
      renderTable(entities);
      offset += entities.length;
      hasMoreResults = entities.length === pageSize;
      loadMoreSentinel.hidden = !hasMoreResults;
    } else {
      rawResponse.textContent = JSON.stringify(payload, null, 2);
      rawResponse.hidden = false;
      hasMoreResults = false;
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    hasMoreResults = false;
  } finally {
    isLoading = false;
    loadMoreStatus.hidden = true;
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) loadResults();
});

observer.observe(loadMoreSentinel);
loadMoreSentinel.hidden = false;
loadResults();
