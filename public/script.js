document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const mainNav = document.getElementById('mainNav');
  const menuToggle = document.getElementById('menuToggle');
  if (mainNav && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !isOpen);
        icon.classList.toggle('fa-times', isOpen);
      }
    });
    mainNav.querySelectorAll('.nav-links a, .nav-links button').forEach((el) => {
      el.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    });
  }

 // -------------------------------
// 1. DISCOUNT SUBSCRIBER - POPUP
// -------------------------------
setTimeout(() => {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.style.display = 'flex';
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
      emailInput.style.color = 'white';
    }
  }
}, 5000);

function closePopup() {
  const popup = document.getElementById('popup');
  if (popup) popup.style.display = 'none';
  clearPopupMessages();
}

function clearPopupMessages() {
  const errorText = document.getElementById('errorText');
  const successText = document.getElementById('successText');
  const couponDisplay = document.getElementById('couponCodeDisplay');
  if (errorText) errorText.textContent = '';
  if (successText) successText.textContent = '';
  if (couponDisplay) couponDisplay.textContent = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});

const closeBtn = document.querySelector('.close');
if (closeBtn) {
  closeBtn.addEventListener('click', closePopup);
  closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closePopup();
    }
  });
}

const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearPopupMessages();

    const emailInput = document.getElementById('email');
    const errorText = document.getElementById('errorText');
    const successText = document.getElementById('successText');
    const couponDisplay = document.getElementById('couponCodeDisplay');
    const submitBtn = subscribeForm.querySelector('button[type="submit"]');
    const emailValue = emailInput ? emailInput.value.trim() : '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      if (errorText) errorText.textContent = 'Please enter a valid email address.';
      emailInput?.focus();
      return;
    }

    emailInput.disabled = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      const res = await fetch('/api/discount-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await res.json();

      if (res.ok && data.couponCode) {
        successText.textContent = data.message || 'Subscription successful!';
        couponDisplay.textContent = `Your Coupon Code: ${data.couponCode}`;
        emailInput.value = '';

        // Optional: Auto-close after showing coupon
        setTimeout(() => {
          closePopup();
          clearPopupMessages();
        }, 4000);
      } else {
        errorText.textContent = data.message || 'Something went wrong.';
        if (data.couponCode && couponDisplay) {
          couponDisplay.textContent = `Your Existing Coupon: ${data.couponCode}`;
        }
        emailInput.focus();
      }
    } catch (err) {
      errorText.textContent = 'Error subscribing. Please try again.';
    } finally {
      emailInput.disabled = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get Coupon';
      }
    }
  });
}


  // ----------------------------------
  // 2. NEWSLETTER SUBSCRIBER - FOOTER
  // ----------------------------------
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('newsletterEmail');
      const messageEl = document.getElementById('newsletterMessage');

      if (!emailInput || !messageEl) return;

      const email = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      messageEl.textContent = '';
      messageEl.style.color = '';

      if (!emailPattern.test(email)) {
        messageEl.style.color = 'orange';
        messageEl.textContent = 'Please enter a valid email.';
        emailInput.focus();
        return;
      }

      emailInput.disabled = true;
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch('/api/newsletter-subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          messageEl.style.color = 'green';
          messageEl.textContent = 'Thank you for subscribing!';
          newsletterForm.reset();
        } else {
          messageEl.style.color = 'red';
          messageEl.textContent = data.message || 'Something went wrong.';
          emailInput.focus();
        }
      } catch (err) {
        messageEl.style.color = 'red';
        messageEl.textContent = 'Error subscribing. Please try again.';
      } finally {
        emailInput.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // -----------------------------------
  // 3. Card Hover Effects (Optional UI)
  // -----------------------------------
  window.rotateCard = function (card) {
    if (card) card.style.transform = 'rotateY(10deg) scale(1.05)';
  };
  window.resetCard = function (card) {
    if (card) card.style.transform = 'rotateY(0deg) scale(1)';
  };

  // ---------------------------------------
  // 4. Login / Logout Button Display Toggle
  // ---------------------------------------
  const loginBtn = document.querySelector('.login-btn');
  const signupBtn = document.querySelector('.signup-btn');
  const logoutBtn = document.getElementById('logoutBtn');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (token && (role === 'admin' || role === 'user')) {
    loginBtn?.style.setProperty('display', 'none');
    signupBtn?.style.setProperty('display', 'none');
    logoutBtn?.style.setProperty('display', 'inline-block');
  } else {
    loginBtn?.style.setProperty('display', 'inline-block');
    signupBtn?.style.setProperty('display', 'inline-block');
    logoutBtn?.style.setProperty('display', 'none');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      loginBtn?.style.setProperty('display', 'inline-block');
      signupBtn?.style.setProperty('display', 'inline-block');
      logoutBtn.style.setProperty('display', 'none');
      window.location.href = 'index.html';
    });
  }

  const cartIcon = document.querySelector('.icon-bar .fa-shopping-cart');
  if (cartIcon) {
    cartIcon.addEventListener('click', () => {
      window.location.href = './cart.html';
    });
    cartIcon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = './cart.html';
      }
    });
  }
});
