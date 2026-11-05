/* ============================================================
   SHREYANSHU KUMAR — PORTFOLIO SCRIPT
   - Global Animated Canvas (Particles & Connecting Lines)
   - Typing Animation, Scroll Reveal, Dynamic Counters
   - Navbar Behavior, Mobile Menu, Contact Validation
============================================================ */

'use strict';

// ─── DOM HELPERS ─────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── 1. GLOBAL ANIMATED CANVAS BACKGROUND ───────────────────
function initAnimatedBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  if (canvas.dataset.initialized) return;
  canvas.dataset.initialized = 'true';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Adaptive particle count based on display size
  function getParticleCount() {
    const area = width * height;
    if (width < 768) return Math.max(24, Math.floor(area / 20000));
    return Math.max(45, Math.min(85, Math.floor(area / 16000)));
  }

  let particleCount = getParticleCount();
  let maxDistance = width < 768 ? 95 : 135;

  const particles = [];

  // Cohesive Burgundy, Latte & Cream palette for particles
  const colors = [
    { r: 114, g: 47, b: 55 },  // Deep Burgundy (#722F37)
    { r: 114, g: 47, b: 55 },  // Deep Burgundy (#722F37)
    { r: 114, g: 47, b: 55 },  // Deep Burgundy (#722F37)
    { r: 183, g: 168, b: 154 }, // Cosmic Latte (#B7A89A)
    { r: 232, g: 220, b: 198 }  // Mocha Cream (#E8DCC6)
  ];

  function updateParticlePalette() {
    const dark = document.documentElement.dataset.theme === 'dark';
    colors.slice(0, 3).forEach(color => Object.assign(color, dark
      ? { r: 168, g: 91, b: 101 } : { r: 114, g: 47, b: 55 }));
  }
  updateParticlePalette();
  document.addEventListener('themechange', () => {
    updateParticlePalette();
    if (prefersReducedMotion) animate();
  });

  class Particle {
    constructor(initial = true) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : Math.random() < 0.5 ? -5 : width + 5;
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.radius = Math.random() * 1.5 + 1.2; // 1.2px - 2.7px

      // Slow, organic floating motion
      const speed = Math.random() * 0.45 + 0.18;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.baseAlpha = Math.random() * 0.35 + 0.35; // 0.35 - 0.70
      this.alpha = this.baseAlpha;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseVal = Math.random() * Math.PI * 2;
    }

    update() {
      if (prefersReducedMotion) return;

      this.x += this.vx;
      this.y += this.vy;

      // Subtle breathing pulse
      this.pulseVal += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.pulseVal) * 0.15;

      // Screen boundary wrapping with smooth margin
      if (this.x < -15) this.x = width + 15;
      else if (this.x > width + 15) this.x = -15;

      if (this.y < -15) this.y = height + 15;
      else if (this.y > height + 15) this.y = -15;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.max(0.1, this.alpha)})`;
      ctx.fill();
    }
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(true));
    }
  }

  createParticles();

  // Mouse interaction
  const mouse = { x: null, y: null, radius: 120 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Main animation frame loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    const len = particles.length;

    // Draw connecting lines between close particles
    for (let i = 0; i < len; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;
        const maxDistSq = maxDistance * maxDistance;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - dist / maxDistance) * 0.28;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(183, 168, 154, ${opacity})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      // Mouse proximity interaction (subtle connection)
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = p1.x - mouse.x;
        const mdy = p1.y - mouse.y;
        const mDistSq = mdx * mdx + mdy * mdy;
        const mMaxSq = mouse.radius * mouse.radius;

        if (mDistSq < mMaxSq) {
          const mDist = Math.sqrt(mDistSq);
          const mOpacity = (1 - mDist / mouse.radius) * 0.32;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(114, 47, 55, ${mOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    for (let i = 0; i < len; i++) {
      particles[i].update();
      particles[i].draw();
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    }
  }

  animate();

  // Resize handling with debouncing
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particleCount = getParticleCount();
      maxDistance = width < 768 ? 95 : 135;
      createParticles();
      if (prefersReducedMotion) {
        animate();
      }
    }, 150);
  }, { passive: true });
}

// ─── 2. NAVBAR SCROLL EFFECT ─────────────────────────────────
const navbar = $('#navbar');
function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// ─── 3. MOBILE HAMBURGER MENU ────────────────────────────────
const hamburger = $('#hamburger');
const navLinks = $('#navLinks');

if (hamburger && navLinks) {
  const mobile = window.matchMedia('(max-width: 768px)');
  function setMenu(open, restoreFocus = false) {
    open = open && mobile.matches;
    navLinks.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.inert = mobile.matches && !open;
    if (restoreFocus) hamburger.focus();
  }
  hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenu(false, mobile.matches));
  });
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) setMenu(false, true);
  });
  navbar.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!navbar.contains(document.activeElement)) setMenu(false);
    });
  });
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);
}

// Explicit theme choices override the system and synchronize across tabs.
const themeToggle = $('#themeToggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme;
try { savedTheme = localStorage.getItem('portfolio-theme'); } catch (_) {}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  document.dispatchEvent(new Event('themechange'));
}
applyTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener('click', () => {
  savedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(savedTheme);
  try { localStorage.setItem('portfolio-theme', savedTheme); } catch (_) {}
});
systemTheme.addEventListener('change', e => {
  if (savedTheme !== 'light' && savedTheme !== 'dark') applyTheme(e.matches ? 'dark' : 'light');
});
window.addEventListener('storage', e => {
  if (e.key !== 'portfolio-theme' && e.key !== null) return;
  savedTheme = e.newValue;
  applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : (systemTheme.matches ? 'dark' : 'light'));
});

// ─── 4. TYPING ANIMATION (ROLES) ─────────────────────────────
const roles = [
  'Full-Stack Developer',
  'Software Engineer',
  'Frontend Specialist',
  'Computer Science Student',
  'Problem Solver (150+ DSA)'
];

const typedEl = $('#typedText');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimer;

function typeRole() {
  if (!typedEl) return;
  const currentRole = roles[roleIndex];

  if (isDeleting) {
    typedEl.textContent = currentRole.slice(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = currentRole.slice(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 45 : 90;

  if (!isDeleting && charIndex === currentRole.length) {
    delay = 1800; // Pause when finished word
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 350;
  }

  typingTimer = setTimeout(typeRole, delay);
}

setTimeout(typeRole, 700);

// ─── 5. SCROLL REVEAL OBSERVER ───────────────────────────────
const revealEls = $$('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('skill-category')) {
          animateSkillBars(entry.target);
        }
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach((el) => {
  const siblings = el.parentElement ? el.parentElement.querySelectorAll('.reveal') : [];
  const siblingIdx = Array.from(siblings).indexOf(el);
  if (siblingIdx > 0) {
    el.style.transitionDelay = `${siblingIdx * 0.08}s`;
  }
  revealObserver.observe(el);
});

// ─── 6. SKILL BARS ANIMATION ─────────────────────────────────
function animateSkillBars(container) {
  const fills = container.querySelectorAll('.skill-fill');
  fills.forEach((fill) => {
    const width = fill.getAttribute('data-width');
    if (width) {
      setTimeout(() => {
        fill.style.width = width + '%';
      }, 150);
    }
  });
}

// Global observer for skill categories
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateSkillBars(entry.target);
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);

$$('.skill-category').forEach((cat) => skillObserver.observe(cat));

// ─── 7. ACHIEVEMENT COUNTERS ─────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  if (isNaN(target)) return;
  const duration = 1600;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.35 }
);

$$('.counter').forEach((el) => counterObserver.observe(el));

// ─── 8. ACTIVE NAV HIGHLIGHT ON SCROLL ───────────────────────
const sections = $$('section[id]');
const navAnchors = $$('.nav-link');

function updateActiveNav() {
  const scrollPos = window.scrollY + 100;
  let active = sections.length ? sections[0].id : '';

  sections.forEach((section) => {
    if (section.offsetTop <= scrollPos) {
      active = section.id;
    }
  });

  navAnchors.forEach((link) => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === active);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// ─── 9. BACK TO TOP BUTTON ───────────────────────────────────
const backToTopBtn = $('#backToTop');
if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── 10. CONTACT FORM VALIDATION & FORMSPREE SUBMISSION ──────
const contactForm = $('#contactForm');
if (contactForm) {
  let isSubmitting = false;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent duplicate submission while in progress
    if (isSubmitting) return;

    let valid = true;

    const nameInput = $('#name');
    const emailInput = $('#email');
    const messageInput = $('#message');

    const nameErr = $('#nameError');
    const emailErr = $('#emailError');
    const msgErr = $('#messageError');
    const successMsg = $('#formSuccess');
    const errorBanner = $('#formError');
    const errorText = $('#formErrorText');
    const submitBtn = $('#submitBtn');

    // Hide any previous status banners
    successMsg.classList.remove('show');
    if (errorBanner) errorBanner.classList.remove('show');

    // 1. Name validation
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      nameInput.classList.add('error');
      nameErr.textContent = 'Please enter your name.';
      valid = false;
    } else {
      nameInput.classList.remove('error');
      nameErr.textContent = '';
    }

    // 2. Email validation
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      emailInput.classList.add('error');
      emailErr.textContent = 'Please enter your email address.';
      valid = false;
    } else if (!emailRegex.test(emailVal)) {
      emailInput.classList.add('error');
      emailErr.textContent = 'Please enter a valid email address.';
      valid = false;
    } else {
      emailInput.classList.remove('error');
      emailErr.textContent = '';
    }

    // 3. Message validation
    const messageVal = messageInput.value.trim();
    if (!messageVal) {
      messageInput.classList.add('error');
      msgErr.textContent = 'Please enter your message.';
      valid = false;
    } else if (messageVal.length < 10) {
      messageInput.classList.add('error');
      msgErr.textContent = 'Please enter a message (at least 10 characters).';
      valid = false;
    } else {
      messageInput.classList.remove('error');
      msgErr.textContent = '';
    }

    if (!valid) return;

    // Loading state & block duplicate submissions
    isSubmitting = true;
    submitBtn.disabled = true;
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> <span>Sending message...</span>';

    // Prepare FormData for Formspree endpoint
    const formData = new FormData(contactForm);

    try {
      const response = await fetch('https://formspree.io/f/meaajpep', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Successful submission
        contactForm.reset();
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 8000);
      } else {
        // Formspree error response
        let errorMsg = 'Oops! There was a problem sending your message. Please try again.';
        try {
          const data = await response.json();
          if (data && data.errors && data.errors.length > 0) {
            errorMsg = data.errors.map(err => err.message).join(', ');
          } else if (data && data.error) {
            errorMsg = data.error;
          }
        } catch (_) {}
        if (errorBanner) {
          if (errorText) errorText.textContent = errorMsg;
          errorBanner.classList.add('show');
        }
      }
    } catch (err) {
      // Network failure
      if (errorBanner) {
        if (errorText) {
          errorText.textContent = 'Network error: Unable to send message. Please check your connection or email me directly at shreyanshukumar23@gmail.com.';
        }
        errorBanner.classList.add('show');
      }
    } finally {
      // Restore submit button state
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });

  // Real-time error clearance on user input
  const inputs = contactForm.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        input.classList.remove('error');
        const errSpan = input.parentElement.querySelector('.form-error');
        if (errSpan) errSpan.textContent = '';
      }
    });
  });
}

// ─── INITIALIZE ANIMATED BACKGROUND ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAnimatedBackground();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initAnimatedBackground();
}
