// ===== LOGIN PAGE — login.js =====

const emailInput = document.getElementById('email');
const passInput  = document.getElementById('password');
const submitBtn  = document.getElementById('submitBtn');
const formMsg    = document.getElementById('formMsg');

function checkFields() {
  submitBtn.disabled =
    emailInput.value.trim() === '' ||
    passInput.value.trim()  === '';
}

emailInput.addEventListener('input', checkFields);
passInput.addEventListener('input',  checkFields);

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

submitBtn.addEventListener('click', async function () {
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Signing in...';
  formMsg.style.display = 'none';
  formMsg.className     = 'form-msg';

  const data = new URLSearchParams();
  data.append('User_Email',    emailInput.value.trim());
  data.append('User_Password', passInput.value);

  try {
    const res  = await fetch('login.php', { method: 'POST', body: data });
    const json = await res.json();

    if (json.success) {
      localStorage.setItem('user_User_Fname', json.User_Fname);
      localStorage.setItem('user_User_Lname', json.User_Lname);
      localStorage.setItem('user_User_Email', json.User_Email);
      localStorage.setItem('user_logged_in',  'true');

      formMsg.textContent = '✓ Login successful! Redirecting...';
      formMsg.classList.add('success');
      formMsg.style.display = 'block';

      setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    } else {
      formMsg.textContent   = json.message || 'Invalid email or password.';
      formMsg.classList.add('error');
      formMsg.style.display = 'block';
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Sign In';
    }
  } catch (err) {
    formMsg.textContent   = 'Network error. Please try again.';
    formMsg.classList.add('error');
    formMsg.style.display = 'block';
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Sign In';
  }
});