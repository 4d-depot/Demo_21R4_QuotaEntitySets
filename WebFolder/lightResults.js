const params = new URLSearchParams(window.location.search);
const entitySetUrl = params.get('entitySet');
const entitySetReference = document.getElementById('entity-set-reference');
const loadingEl = document.getElementById('state-loading');
const errorPanel = document.getElementById('error-panel');
const errorMessage = document.getElementById('error-message');
const resultsContainer = document.getElementById('results-container');
const columns = ['firstname', 'lastname', 'jobTitle', 'salary'];

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

function renderTable(entities) {
  if (entities.length === 0) {
    resultsContainer.textContent = 'No results found.';
    resultsContainer.hidden = false;
    return;
  }

  const table = document.createElement('table');
  table.className = 'results';
  const headerRow = document.createElement('tr');
  const tableHead = document.createElement('thead');
  const tableBody = document.createElement('tbody');

  columns.forEach((column) => {
    const cell = document.createElement('th');
    cell.textContent = column;
    headerRow.appendChild(cell);
  });
  tableHead.appendChild(headerRow);

  entities.forEach((entity) => {
    const row = document.createElement('tr');
    columns.forEach((column) => {
      const cell = document.createElement('td');
      const value = entity[column];
      cell.textContent = value === null || value === undefined ? '' : String(value);
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });

  table.append(tableHead, tableBody);
  resultsContainer.appendChild(table);
  resultsContainer.hidden = false;
}

async function loadLightResults() {
  if (!entitySetUrl || !entitySetUrl.includes('/$entityset/')) {
    showError('No entity set reference was provided. Return to the results page and try again.');
    return;
  }

  entitySetReference.textContent = entitySetUrl;

  try {
    const response = await fetch(entitySetUrl, {
      headers: { Accept: 'application/json' },
      credentials: 'include'
    });
    const payloadText = await response.text();
    let payload;

    try {
      payload = payloadText ? JSON.parse(payloadText) : null;
    } catch {
      throw new Error(`The REST server returned invalid JSON (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      const detail = payload && (payload.__ERROR || payload.error || payload.message);
      throw new Error(detail ? String(detail) : `HTTP ${response.status}`);
    }

    const entities = getEntities(payload);
    if (!entities) throw new Error('The REST response does not contain an entity collection.');

    loadingEl.hidden = true;
    renderTable(entities);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'An unexpected error occurred.');
  }
}

loadLightResults();
