const form = document.getElementById('login-form');
const status = document.getElementById('login-status');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value;

  if (!identifier || !password) {
    status.textContent = 'Please enter your identifier and password.';
    status.hidden = false;
    status.classList.remove('success');
    return;
  }

  status.textContent = 'Authenticating...';
  status.hidden = false;
  status.classList.remove('success');

  try {
    const response = await fetch('/rest/$catalog/authentify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify([
        {
          identifier: identifier,
          password: password
        }
      ])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Authentication failed.');
    }

    status.textContent = 'Authentication successful. Redirecting...';
    status.classList.add('success');

    setTimeout(function () {
      window.location.href = 'search.html';
    }, 500);
  } catch (error) {
    status.textContent = error.message || 'Authentication failed.';
    status.classList.remove('success');
  }
});
