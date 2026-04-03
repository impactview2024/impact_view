/* ============================================
   IMPACTVIEW — Main JavaScript
   ============================================ */

// ── Hero Vanta background (desktop only) ──
const heroSection = document.querySelector('#hero');
const heroVideo = document.querySelector('.hero-video-bg');
const mobileViewportQuery = window.matchMedia('(max-width: 768px)');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function shouldUseMobileHeroVideo() {
  const saveDataEnabled = navigator.connection?.saveData === true;
  const lowMemoryDevice =
    typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;

  return mobileViewportQuery.matches && !reducedMotionQuery.matches && !saveDataEnabled && !lowMemoryDevice;
}

if (heroSection && window.innerWidth > 768) {
  const threeScript = document.createElement('script');
  threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js';
  threeScript.onload = () => {
    const vantaScript = document.createElement('script');
    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js';
    vantaScript.onload = () => {
      if (window.VANTA?.CLOUDS) {
        window.VANTA.CLOUDS({
          el: heroSection,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          backgroundColor: 0x0,
          skyColor: 0x0,
          cloudColor: 0x5858e6,
          cloudShadowColor: 0x0,
          sunColor: 0x50200,
          sunGlareColor: 0x0,
          sunlightColor: 0x0
        });
      }
    };
    document.head.appendChild(vantaScript);
  };
  document.head.appendChild(threeScript);
}

if (heroSection && heroVideo) {
  const playHeroVideo = () => {
    if (!shouldUseMobileHeroVideo() || document.visibilityState !== 'visible') {
      return;
    }

    const playPromise = heroVideo.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  };

  const pauseHeroVideo = () => {
    heroVideo.pause();
  };

  if (shouldUseMobileHeroVideo()) {
    const revealHeroVideo = () => {
      heroVideo.classList.add('is-ready');
    };

    heroVideo.preload = 'auto';

    heroVideo.addEventListener('loadeddata', revealHeroVideo, { once: true });

    if (heroVideo.readyState >= 2) {
      revealHeroVideo();
    }

    heroVideo.load();
    playHeroVideo();

    const heroVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playHeroVideo();
          return;
        }

        pauseHeroVideo();
      });
    }, { threshold: 0.18 });

    heroVideoObserver.observe(heroSection);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        pauseHeroVideo();
        return;
      }

      if (heroSection.getBoundingClientRect().bottom > 0) {
        playHeroVideo();
      }
    });
  }
}

// ── Hero desc — word stagger ──
const descEl = document.querySelector('[data-word-stagger]');
if (descEl) {
  const text = descEl.textContent.trim();
  const words = text.split(/\s+/);
  const BASE_DELAY = 0.92; // seconds — starts after blur-reveal of sub
  const STEP = 0.055;

  descEl.innerHTML = words
    .map((w, i) => `<span class="word" style="animation-delay:${(BASE_DELAY + i * STEP).toFixed(3)}s">${w}</span>`)
    .join(' ');
}

// ── Nav scroll behavior ──
const nav = document.querySelector('.nav');

if (nav) {
  let navScrollTicking = false;

  const syncNavScrollState = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    navScrollTicking = false;
  };

  syncNavScrollState();

  window.addEventListener('scroll', () => {
    if (navScrollTicking) return;

    navScrollTicking = true;
    window.requestAnimationFrame(syncNavScrollState);
  }, { passive: true });
}

// ── Mobile menu ──
const hamburger = document.querySelector('.nav-hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger?.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  const isOpen = navMenu.classList.contains('open');
  hamburger.classList.toggle('is-open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// close menu on nav link click
navMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger?.classList.remove('is-open');
    hamburger?.setAttribute('aria-expanded', 'false');
  });
});

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Why section text slide-in (once) ──
const whySlideObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('is-inview');
    whySlideObserver.unobserve(entry.target);
  });
}, { threshold: 0.35, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.why-slide-in').forEach(el => whySlideObserver.observe(el));

// ── Stats count-up ──
function animateCounter(el) {
  const target = Number.parseInt(el.dataset.target || '0', 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(target * eased);

    el.textContent = current.toLocaleString('ko-KR') + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toLocaleString('ko-KR') + suffix;
    }
  };

  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    animateCounter(el);
    statObserver.unobserve(el);
  });
}, { threshold: 0.55 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => statObserver.observe(el));

// ── Duplicate review cards for infinite scroll ──
const track = document.querySelector('.reviews-track');
if (track) {
  const cards = track.innerHTML;
  track.innerHTML = cards + cards; // duplicate for seamless loop
}

// ── Contact form submit ──
const contactForm = document.querySelector('#contactForm');
if (contactForm) {
  const submitButton = contactForm.querySelector('.btn-submit');
  const cancelButton = contactForm.querySelector('.btn-cancel');
  const defaultSubmitText = submitButton?.textContent.trim() || '문의 등록하기';
  const successSubmitText = '문의하기 하셨습니다.';

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!submitButton || submitButton.disabled) return;
    if (!contactForm.reportValidity()) return;

    submitButton.disabled = true;
    cancelButton?.setAttribute('disabled', 'disabled');
    submitButton.classList.add('is-loading');
    submitButton.textContent = '전송 중...';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: {
          Accept: 'application/json'
        }
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Form submission failed');
      }

      contactForm.reset();
      submitButton.classList.remove('is-loading');
      submitButton.classList.add('is-success');
      submitButton.textContent = successSubmitText;
    } catch (error) {
      submitButton.disabled = false;
      cancelButton?.removeAttribute('disabled');
      submitButton.classList.remove('is-loading');
      submitButton.textContent = defaultSubmitText;
    }
  });
}

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--indigo-light)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => activeObserver.observe(s));
