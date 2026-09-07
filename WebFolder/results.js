const params = new URLSearchParams(window.location.search);
const apiUrl = params.get('apiUrl');
const queryPreview = document.getElementById('query-preview');
const loadingEl = document.getElementById('state-loading');
const errorPanel = document.getElementById('error-panel');
const errorMessage = document.getElementById('error-message');
const resultsContainer = document.getElementById('results-container');
const rawResponse = document.getElementById('raw-response');
const infoBar = document.getElementById('info-bar');
const resultCount = document.getElementById('result-count');
const entitySet = document.getElementById('entity-set');

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
  resultsContainer.innerHTML = '';

  if (entities.length === 0) {
    resultsContainer.textContent = 'No results found.';
    resultsContainer.hidden = false;
    return;
  }

  const columns = [...new Set(entities.flatMap((entity) => Object.keys(entity)))];
  const table = document.createElement('table');
  table.className = 'results';

  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach((column) => {
    const cell = document.createElement('th');
    cell.textContent = column;
    headerRow.appendChild(cell);
  });
  head.appendChild(headerRow);
  table.appendChild(head);

  const body = document.createElement('tbody');
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
    body.appendChild(row);
  });
  table.appendChild(body);
  resultsContainer.appendChild(table);
  resultsContainer.hidden = false;
}

async function loadResults() {
  if (!apiUrl) {
    showError('No REST query was provided. Return to the search page and try again.');
    return;
  }

  queryPreview.textContent = apiUrl;

  try {
    const response = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
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
    resultCount.textContent = entities ? entities.length : '-';
    entitySet.textContent = getEntitySet(payload);

    if (entities) {
      renderTable(entities);
    } else {
      rawResponse.textContent = JSON.stringify(payload, null, 2);
      rawResponse.hidden = false;
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : 'An unexpected error occurred.');
  }
}

loadResults();
