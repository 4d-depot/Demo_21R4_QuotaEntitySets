// search.js
// Builds a $filter expression from the form fields and launches an
// entity-set-creating REST query ($method=entityset) in a new tab.

const form = document.getElementById('search-form');
const baseUrlInput = document.getElementById('baseUrl');
const dataClassInput = document.getElementById('dataClass');
const firstnameInput = document.getElementById('firstname');
const lastnameInput = document.getElementById('lastname');
const jobTitleInput = document.getElementById('jobTitle');
const salaryMinInput = document.getElementById('salaryMin');
const salaryMaxInput = document.getElementById('salaryMax');
const previewEl = document.getElementById('query-preview');
const errorEl = document.getElementById('form-error');
const clearMemoryButton = document.getElementById('clear-memory-button');
const logoutButton = document.getElementById('logout-button');

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
  const base = baseUrlInput.value.trim().replace(/\/+$/, '');
  const dataClass = dataClassInput.value.trim() || 'Employees';
  const filter = buildFilter();

  if (!base || !filter) return null;

  return `${base}/${dataClass}?$filter=${filter}&$method=entityset`;
}

function updatePreview() {
  const url = buildUrl();
  previewEl.textContent = url || 'Fill in at least one field to build a query…';
}

[
  baseUrlInput, dataClassInput, firstnameInput,
  lastnameInput, jobTitleInput, salaryMinInput, salaryMaxInput
].forEach((el) => el.addEventListener('input', updatePreview));

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const url = buildUrl();
  if (!url) {
    errorEl.textContent = 'Fill in the base URL and at least one search field.';
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  sessionStorage.setItem('apiUrl', url);
  window.open('results.html', '_blank');
});

async function clearSessionMemoryAndRedirect() {
  sessionStorage.removeItem('apiUrl');

  try {
    await fetch('/rest/$catalog/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
  } catch (error) {
    // ignore logout request failure and redirect to login page
  }

  window.location.href = 'login.html';
}

clearMemoryButton.addEventListener('click', clearSessionMemoryAndRedirect);
logoutButton.addEventListener('click', clearSessionMemoryAndRedirect);

updatePreview();
