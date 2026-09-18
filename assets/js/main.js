document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('[data-purpose="mobile-menu-btn"]');
  const mobileMenu = document.querySelector('[data-purpose="mobile-menu"]');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Scroll Animations
  const observerOptions = {
    threshold: 0.1
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // Multilingual Logic
  const langToggle = document.getElementById('lang-toggle');
  let currentLang = 'en';

  function applyLanguage(lang) {
    // Determine target texts
    const targetTexts = translations[lang];
    if (!targetTexts) return;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (targetTexts[key]) {
        el.innerText = targetTexts[key];
      }
    });

    // Update all input placeholders with data-placeholder-i18n
    document.querySelectorAll('[data-placeholder-i18n]').forEach(el => {
      const key = el.getAttribute('data-placeholder-i18n');
      if (targetTexts[key]) {
        el.placeholder = targetTexts[key];
      }
    });

    // Update direction and font
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      document.body.classList.add('font-arabic');
      document.body.classList.remove('font-sans');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      document.body.classList.remove('font-arabic');
      document.body.classList.add('font-sans');
    }

    // Toggle button text
    const currentLangTxt = document.getElementById('current-lang-txt');
    if (currentLangTxt) {
      currentLangTxt.innerText = lang === 'en' ? 'EN' : 'عربي';
    }
  }

  // Event Listener for the toggle
  const langSwitches = document.querySelectorAll('[data-lang-switch]');
  
  function handleLangSwitch(e) {
    if(e) e.preventDefault();
    const selectedLang = this.getAttribute('data-lang-switch');
    if (selectedLang !== currentLang) {
      currentLang = selectedLang;
      applyLanguage(currentLang);
    }
  }

  langSwitches.forEach(btn => {
    btn.addEventListener('click', handleLangSwitch);
  });

  // --- PRICING PLAN AUTO-SELECT LOGIC ---
  function preselectPlanFromUrl() {
    // Check if there is a 'plan' query parameter or hash
    const urlParams = new URLSearchParams(window.location.search);
    let plan = urlParams.get('plan');
    
    // Fallback: Check hash if used as #contact?plan=basic
    if (!plan && window.location.hash.includes('?plan=')) {
      plan = window.location.hash.split('?plan=')[1];
    }

    if (plan) {
      const planSelect = document.getElementById('plan-select');
      if (planSelect) {
        // Find the option with the matching value
        for (let i = 0; i < planSelect.options.length; i++) {
          if (planSelect.options[i].value === plan.toLowerCase()) {
            planSelect.selectedIndex = i;
            break;
          }
        }
      }
      
      // Smooth scroll if an anchor exists in hash
      if(window.location.hash.startsWith('#contact')) {
          const contactSec = document.getElementById('contact');
          if(contactSec) {
              setTimeout(() => contactSec.scrollIntoView({ behavior: 'smooth' }), 300);
          }
      }
    }
  }

  // Run on page load
  preselectPlanFromUrl();

  // Listen for hash changes to handle dynamic clicks without page reload
  window.addEventListener('hashchange', preselectPlanFromUrl);
  
  // Intercept pricing button clicks to ensure smooth scrolling + parameter passing
  document.querySelectorAll('a[href^="#contact?plan="]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetUrl = this.getAttribute('href');
          // Push state to update URL and trigger logic
          history.pushState(null, null, targetUrl);
          preselectPlanFromUrl();
      });
  });

  // --- CONTACT FORM INTEGRATION ---
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Visual feedback: 'Sending...' state
      const originalBtnText = submitBtn.innerText;
      submitBtn.innerText = translations[currentLang]['contact_sending'] || 'Sending...';
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
      
      formStatus.classList.add('hidden');
      formStatus.classList.remove('bg-green-500/20', 'text-green-400', 'bg-red-500/20', 'text-red-400');

      // Send to wahadmomo@gmail.com using FormSubmit AJAX API
      fetch("https://formsubmit.co/ajax/wahadmomo@gmail.com", {
          method: "POST",
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              name: document.getElementById('user_name').value,
              email: document.getElementById('user_email').value,
              phone: document.getElementById('user_phone').value,
              plan: document.getElementById('plan-select').value,
              message: document.getElementById('message').value,
              _subject: "New Lead from Iron Core Gym Site",
              _template: "box"
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success || data.success === "true") {
              // Success
              submitBtn.innerText = originalBtnText;
              submitBtn.disabled = false;
              submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
              
              formStatus.innerText = translations[currentLang]['contact_success'] || 'Message sent successfully!';
              formStatus.classList.remove('hidden');
              formStatus.classList.add('block', 'bg-green-500/20', 'text-green-400');
              
              contactForm.reset();
          } else {
              throw new Error("Submission failed");
          }
      })
      .catch((error) => {
          // Error
          console.error("FormSubmit Error:", error);
          submitBtn.innerText = originalBtnText;
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');

          formStatus.innerText = translations[currentLang]['contact_error'] || 'Error sending message.';
          formStatus.classList.remove('hidden');
          formStatus.classList.add('block', 'bg-red-500/20', 'text-red-400');
      });
    });
  }

});
