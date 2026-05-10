// ===== LOGIN PAGE — login.js (single form, auto-detects user vs staff) =====

// ── Auto-redirect if already logged in (runs immediately, before DOM needed) ──
if (localStorage.getItem('user_logged_in') === 'true') {
  window.location.href = 'index.html';
}
if (localStorage.getItem('staff_logged_in') === 'true') {
  window.location.href = 'staff-dashboard.html';
}

// ── Toggle password visibility (called inline from HTML, must be global) ──
function togglePass(fieldId, btn) {
  const input = document.getElementById(fieldId);
  const icon  = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

document.addEventListener('DOMContentLoaded', function () {

  const identifierInput = document.getElementById('identifier');
  const passInput       = document.getElementById('password');
  const submitBtn       = document.getElementById('submitBtn');
  const formMsg         = document.getElementById('formMsg');

  // ── Enable submit when both fields have values ──
  function checkFields() {
    submitBtn.disabled =
      identifierInput.value.trim() === '' ||
      passInput.value.trim() === '';
  }

  identifierInput.addEventListener('input', checkFields);
  passInput.addEventListener('input', checkFields);

  // Allow Enter to submit
  [identifierInput, passInput].forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !submitBtn.disabled) submitBtn.click();
    });
  });

  // ── Show message ──
  function showMsg(text, type) {
    formMsg.textContent   = text;
    formMsg.className     = 'form-msg ' + type;
    formMsg.style.display = 'block';
  }

  function resetBtn() {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Sign In';
  }

  // ── Submit: try customer login first, then staff login ──
  submitBtn.addEventListener('click', async function () {
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Signing in...';
    formMsg.style.display = 'none';
    formMsg.className     = 'form-msg';

    const identifier = identifierInput.value.trim();
    const password   = passInput.value;

    try {
      // 1️⃣ Try customer login (email + password)
      const userBody = new URLSearchParams({
        User_Email:    identifier,
        User_Password: password
      });
      const userRes  = await fetch('login.php', { method: 'POST', body: userBody });
      const userJson = await userRes.json();

      if (userJson.success) {
        localStorage.setItem('user_User_Fname', userJson.User_Fname);
        localStorage.setItem('user_User_Lname', userJson.User_Lname);
        localStorage.setItem('user_User_Email', userJson.User_Email);
        localStorage.setItem('user_User_Role',  userJson.User_Role);
        localStorage.setItem('user_logged_in',  'true');

        showMsg('✓ Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        return;
      }

      // 2️⃣ Try staff login (username + password)
      const staffBody = new URLSearchParams({
        username: identifier,
        password: password
      });
      const staffRes  = await fetch('staff-login.php', { method: 'POST', body: staffBody });
      const staffJson = await staffRes.json();

      if (staffJson.success) {
        localStorage.setItem('staff_logged_in',  'true');
        localStorage.setItem('staff_username',   staffJson.username);
        localStorage.setItem('staff_name',       staffJson.name);
        localStorage.setItem('staff_role',       staffJson.role);
        localStorage.setItem('staff_hotel_id',   staffJson.hotel_id);
        localStorage.setItem('staff_hotel_name', staffJson.hotel_name);

        showMsg('✓ Login successful! Redirecting to dashboard...', 'success');
        setTimeout(() => { window.location.href = 'staff-dashboard.html'; }, 1000);
        return;
      }

      // Both failed
      showMsg('Invalid email/username or password.', 'error');
      resetBtn();

    } catch (err) {
      showMsg('Network error. Please try again.', 'error');
      resetBtn();
    }
  });

});