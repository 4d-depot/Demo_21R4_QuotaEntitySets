// search.js
// Builds a $filter expression from the form fields and launches an
// entity-set-creating REST query ($method=entityset) in a new tab.

const form = document.getElementById('search-form');
const firstnameInput = document.getElementById('firstname');
const lastnameInput = document.getElementById('lastname');
const jobTitleInput = document.getElementById('jobTitle');
const salaryMinInput = document.getElementById('salaryMin');
const salaryMaxInput = document.getElementById('salaryMax');
const previewEl = document.getElementById('query-preview');
const errorEl = document.getElementById('form-error');
const entitySetListEl = document.getElementById('entity-set-list');
const clearMemoryButton = document.getElementById('clear-memory-button');
const logoutButton = document.getElementById('logout-button');
const REST_BASE_URL = 'http://127.0.0.1/rest';
const DATA_CLASS = 'Employees';
const ENTITY_SET_STORAGE_KEY = 'entitySetRefs';

// Wrap text values with @...@ (4D wildcard) so the search matches values
// that *contain* the typed text. Drop the leading @ for a "starts with"
// search instead, e.g. `firstname = ${value}@`.
//
function textClause(field, value) {
  return `${field}=@${value}@`;
}

function buildFilter() {
  const clauses = [];

  const firstname = firstnameInput.value.trim();
  const lastname = lastnameInput.value.trim();
  const jobTitle = jobTitleInput.value.trim();
  const salaryMin = salaryMinInput.value.trim();
  const salaryMax = salaryMaxInput.value.trim();

  if (firstname) clauses.push(textClause('firstname', firstname));
  if (lastname) clauses.push(textClause('lastname', lastname));
  if (jobTitle) clauses.push(textClause('jobTitle', jobTitle));
  if (salaryMin) clauses.push(`salary >= ${Number(salaryMin)}`);
  if (salaryMax) clauses.push(`salary <= ${Number(salaryMax)}`);

  return clauses.join(' AND ');
}

function buildUrl() {
  const filter = buildFilter();

  if (!filter) return null;

  return `${REST_BASE_URL}/${DATA_CLASS}?$filter=${filter}&$method=entityset`;
}

function getStoredEntitySetRefs() {
  try {
    const value = sessionStorage.getItem(ENTITY_SET_STORAGE_KEY);
    const refs = value ? JSON.parse(value) : [];

    if (!Array.isArray(refs)) return [];

    return refs
      .filter((ref) => typeof ref === 'string' && ref.trim() !== '')
      .map((ref) => String(ref));
  } catch (error) {
    return [];
  }
}

function saveStoredEntitySetRefs(refs) {
  const cleanRefs = Array.isArray(refs)
    ? refs.filter((ref) => typeof ref === 'string' && ref.trim() !== '').map((ref) => String(ref))
    : [];

  sessionStorage.setItem(ENTITY_SET_STORAGE_KEY, JSON.stringify(cleanRefs));
}

function extractEntitySetId(ref) {
  if (typeof ref !== 'string') return '';

  const normalized = ref.trim();
  if (!normalized) return '';

  const entitySetToken = '/$entityset/';
  const index = normalized.lastIndexOf(entitySetToken);
  if (index === -1) return normalized;

  return normalized.slice(index + entitySetToken.length).trim();
}

function renderStoredEntitySetRefs() {
  const refs = getStoredEntitySetRefs();
  entitySetListEl.innerHTML = '';

  if (!refs.length) {
    const item = document.createElement('li');
    item.textContent = 'No entity set reference created yet.';
    item.classList.add('empty-state');
    entitySetListEl.appendChild(item);
    return;
  }

  refs.forEach((ref) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const href = ref.startsWith('http') ? ref : `http://127.0.0.1${ref.startsWith('/') ? ref : '/' + ref}`;

    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = ref;
    item.appendChild(link);
    entitySetListEl.appendChild(item);
  });
}

function updatePreview() {
  const url = buildUrl();
  previewEl.textContent = url || 'Fill in at least one field to build a query…';
}

[
  firstnameInput, lastnameInput, jobTitleInput, salaryMinInput, salaryMaxInput
].forEach((el) => el.addEventListener('input', updatePreview));

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;

  const entitySetRef = event.data && event.data.entitySetRef;
  if (event.data?.type !== 'entitySetCreated' || typeof entitySetRef !== 'string') return;

  const refs = getStoredEntitySetRefs();
  if (!refs.includes(entitySetRef)) {
    refs.push(entitySetRef);
    saveStoredEntitySetRefs(refs);
    renderStoredEntitySetRefs();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const url = buildUrl();
  if (!url) {
    errorEl.textContent = 'Fill in the base URL and at least one search field.';
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  localStorage.setItem('apiUrl', url);
  window.open('results.html', '_blank');
});

async function clearSessionMemory() {
  const storedRefs = getStoredEntitySetRefs();
  const entitySetCollection = Array.isArray(storedRefs)
    ? storedRefs
        .map((ref) => extractEntitySetId(ref))
        .filter((id) => typeof id === 'string' && id.trim() !== '')
        .map((id) => String(id))
    : [];
  try {
    if (entitySetCollection.length > 0) {
      await fetch('/rest/$entityset/$release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(entitySetCollection)
      });
    }
  } catch (error) {
    // ignore release request failure and continue with local cleanup
  }

  localStorage.removeItem('apiUrl');
  sessionStorage.removeItem('apiUrl');
  sessionStorage.removeItem(ENTITY_SET_STORAGE_KEY);
  renderStoredEntitySetRefs();
}

clearMemoryButton.addEventListener('click', clearSessionMemory);
logoutButton.addEventListener('click', async () => {
  localStorage.removeItem('apiUrl');
  sessionStorage.removeItem('apiUrl');
  sessionStorage.removeItem(ENTITY_SET_STORAGE_KEY);
  renderStoredEntitySetRefs();

  try {
    await fetch('/rest/$catalog/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
  } catch (error) {
    // Ignore logout request failure and redirect to the login page.
  }

  window.location.href = 'login.html';
});

renderStoredEntitySetRefs();
updatePreview();
