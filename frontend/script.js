/* script.js */ document.addEventListener('DOMContentLoaded', () => { const loginForm = document.getElementById('loginForm'); const signupForm = document.getElementById('signupForm');

if (localStorage.getItem('user') && window.location.pathname.includes('index.html')) { window.location.href = 'home.html'; }

if (signupForm) { signupForm.addEventListener('submit', (e) => { e.preventDefault(); const name = document.getElementById('signupName').value; const email = document.getElementById('signupEmail').value; const password = document.getElementById('signupPassword').value;

localStorage.setItem('user', JSON.stringify({ name, email, password }));
  window.location.href = 'home.html';
});

}

if (loginForm) { loginForm.addEventListener('submit', (e) => { e.preventDefault(); const email = document.getElementById('loginEmail').value; const password = document.getElementById('loginPassword').value;

const storedUser = JSON.parse(localStorage.getItem('user'));

  if (storedUser && storedUser.email === email && storedUser.password === password) {
    window.location.href = 'home.html';
  } else {
    alert('Invalid email or password.');
  }
});

} });