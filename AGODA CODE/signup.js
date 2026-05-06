// ===== SIGN UP PAGE — signup.js =====

const firstName       = document.getElementById('firstName');
const lastName        = document.getElementById('lastName');
const email           = document.getElementById('email');
const contact         = document.getElementById('contact');
const password        = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const submitBtn       = document.getElementById('submitBtn');
const formMsg         = document.getElementById('formMsg');
const passMsg         = document.getElementById('passMsg');

// ── Enable button when all fields filled and passwords match ──
function checkFields() {
  const allFilled =
    firstName.value.trim()       !== '' &&
    lastName.value.trim()        !== '' &&
    email.value.trim()           !== '' &&
    contact.value.trim()         !== '' &&
    password.value.trim()        !== '' &&
    confirmPassword.value.trim() !== '';

  const passMatch = password.value === confirmPassword.value;

  if (confirmPassword.value.trim() !== '') {
    if (passMatch) {
      passMsg.textContent = '✓ Passwords match';
      passMsg.style.color = '#2e7d32';
    } else {
      passMsg.textContent = '✗ Passwords do not match';
      passMsg.style.color = '#c62828';
    }
    passMsg.style.display = 'block';
  } else {
    passMsg.style.display = 'none';
  }

  submitBtn.disabled = !(allFilled && passMatch);
}

firstName.addEventListener('input',       checkFields);
lastName.addEventListener('input',        checkFields);
email.addEventListener('input',           checkFields);
contact.addEventListener('input',         checkFields);
password.addEventListener('input',        checkFields);
confirmPassword.addEventListener('input', checkFields);

contact.addEventListener('keypress', function (e) {
  if (!/[0-9]/.test(e.key)) e.preventDefault();
});

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
  submitBtn.textContent = 'Creating...';
  formMsg.style.display = 'none';
  formMsg.className     = 'form-msg';

  const data = new URLSearchParams();
  data.append('User_Fname',    firstName.value.trim());
  data.append('User_Lname',    lastName.value.trim());
  data.append('User_Email',    email.value.trim());
  data.append('User_Phone',    '+63' + contact.value.trim());
  data.append('User_Password', password.value);

  try {
    const res  = await fetch('register.php', { method: 'POST', body: data });
    const json = await res.json();

    if (json.success) {
      localStorage.setItem('user_User_Fname', firstName.value.trim());
      localStorage.setItem('user_User_Lname', lastName.value.trim());
      localStorage.setItem('user_User_Email', email.value.trim());
      localStorage.setItem('user_logged_in',  'true');

      formMsg.textContent = '✓ Account created successfully! Redirecting...';
      formMsg.classList.add('success');
      formMsg.style.display = 'block';

      setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    } else {
      formMsg.textContent   = json.message || 'Something went wrong. Please try again.';
      formMsg.classList.add('error');
      formMsg.style.display = 'block';
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Create Account';
    }
  } catch (err) {
    formMsg.textContent   = 'Network error. Please try again.';
    formMsg.classList.add('error');
    formMsg.style.display = 'block';
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Create Account';
  }
});