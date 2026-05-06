// ===== NAVBAR STATE — navbar.js =====
document.addEventListener('DOMContentLoaded', function () {

  const navRight = document.querySelector('.nav-right');
  if (!navRight) return;

  const isLoggedIn = localStorage.getItem('user_logged_in') === 'true';

  if (isLoggedIn) {
    const firstName    = localStorage.getItem('user_User_Fname') || '';
    const lastName     = localStorage.getItem('user_User_Lname') || '';
    const displayName  = firstName + ' ' + (lastName.charAt(0).toUpperCase() + '.');
    const avatarLetter = firstName.charAt(0).toUpperCase();

    navRight.innerHTML = `
      <div class="nav-right-inner">
        <button class="btn-list">List your place</button>
        <button class="nav-lang-btn">
          <img src="https://flagcdn.com/w40/gb.png" class="nav-flag" alt="EN"/>
        </button>
        <button class="nav-currency-btn">₱</button>
      </div>

      <div class="nav-user-wrap">
        <button class="nav-user" id="navUserBtn">
          <div class="avatar">${avatarLetter}</div>
          <div class="user-info">
            <span class="user-name">${displayName}</span>
            <img src="vip.png" alt="VIP Bronze" class="vip-badge-img"/>
          </div>
          <i class="fa fa-chevron-down"></i>
        </button>

        <div class="dropdown-menu" id="userDropdown">
          <p class="menu-title">MY ACCOUNT</p>
          <a href="#">My Trips</a>
          <a href="#">Saved Properties</a>
          <a href="#">Profile</a>
          <button class="logout-btn" id="logoutBtn">SIGN OUT</button>
        </div>
      </div>
    `;

    document.getElementById('navUserBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      const menu = document.getElementById('userDropdown');
      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    });

    document.addEventListener('click', function () {
      const menu = document.getElementById('userDropdown');
      if (menu) menu.style.display = 'none';
    });

    document.getElementById('logoutBtn').addEventListener('click', function () {
      localStorage.clear();
      window.location.href = 'index.html';
    });

  } else {
    navRight.innerHTML = `
      <div class="nav-right-inner">
        <button class="btn-list">List your place</button>
        <button class="nav-lang-btn">
          <img src="https://flagcdn.com/w40/gb.png" class="nav-flag" alt="EN"/>
        </button>
        <button class="nav-currency-btn">₱</button>
      </div>

      <a href="login.html" class="nav-signin">Sign in</a>
      <button onclick="window.location.href='signup.html'" class="btn-create-account">Create account</button>
      <button class="nav-hamburger"><i class="fa fa-bars"></i></button>
    `;
  }
});