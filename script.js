/* ================================================================
   PORTFOLIO — MAIN SCRIPT (Premium Enhanced)
   Three.js · GSAP · Lenis · Typed.js · Vanilla Tilt · AOS
   ================================================================ */
'use strict';

/* ══════════════════════════════════════════════════════════════
   1. LOADING SCREEN
══════════════════════════════════════════════════════════════ */
function initLoader() {
  const loader   = document.getElementById('loader');
  const fill     = document.getElementById('loader-fill');
  if (!loader || !fill) return;

  let progress = 0;
  const speed  = 30; // ms per tick

  // Animate progress bar to 100%
  const tick = setInterval(() => {
    progress += Math.random() * 8 + 2;
    if (progress >= 100) { progress = 100; clearInterval(tick); }
    fill.style.width = progress + '%';
  }, speed);

  // Fade out after 2 seconds
  setTimeout(() => {
    loader.classList.add('done');
    // Trigger entrance animations after loader is gone
    triggerHeroEntrance();
  }, 2000);
}

function triggerHeroEntrance() {
  // Hero elements animate in via AOS + GSAP
  gsap.from('.hero-content', {
    opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: 0.3
  });
}

/* ══════════════════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = Math.min((scrolled / total) * 100, 100) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════════════════════════ */
function initCursor() {
  // Only on desktop
  if (window.matchMedia('(max-width: 768px)').matches) {
    document.getElementById('cursor-outer').style.display = 'none';
    document.getElementById('cursor-inner').style.display = 'none';
    return;
  }

  const outer = document.getElementById('cursor-outer');
  const inner = document.getElementById('cursor-inner');
  if (!outer || !inner) return;

  let mouseX = -300, mouseY = -300;
  let outerX = -300, outerY = -300;

  // Track mouse position — inner follows instantly
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    inner.style.left = mouseX + 'px';
    inner.style.top  = mouseY + 'px';
  });

  // Outer follows lazily (lerp)
  function lerpCursor() {
    outerX += (mouseX - outerX) * 0.1;
    outerY += (mouseY - outerY) * 0.1;
    outer.style.left = outerX + 'px';
    outer.style.top  = outerY + 'px';
    requestAnimationFrame(lerpCursor);
  }
  lerpCursor();

  // Hover effects on interactive elements
  const targets = 'a, button, .btn, .project-card, .skill-card, .achievement-card, .contact-card, .social-row, .filter-tab, .ach-pdf-btn, .project-link, input, textarea';

  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => outer.classList.add('hovering'));
    el.addEventListener('mouseleave', () => outer.classList.remove('hovering'));
  });

  // Click effect
  document.addEventListener('mousedown', () => outer.classList.add('clicking'));
  document.addEventListener('mouseup',   () => outer.classList.remove('clicking'));

  // Click ripple
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top  = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => { outer.style.opacity = '0'; inner.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { outer.style.opacity = '1'; inner.style.opacity = '1'; });
}

/* ══════════════════════════════════════════════════════════════
   4. THREE.JS HERO BACKGROUND
══════════════════════════════════════════════════════════════ */
function initThreeJS() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = window.innerWidth, H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 1000);
  camera.position.z = 5;

  const COUNT = 120;
  const positions = new Float32Array(COUNT * 3);
  const velocities = [];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    velocities.push({
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.003,
      z: (Math.random() - 0.5) * 0.003
    });
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.03,
    transparent: true,
    opacity: 0.5,
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  const lineMat = new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0.12,
  });
  
  function updateColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    pMat.color.setHex(isDark ? 0x00D4FF : 0x0F172A);
    lineMat.color.setHex(isDark ? 0x5E35FF : 0x2563EB);
  }
  updateColors();
  window.addEventListener('themeChanged', updateColors);
  
  const connectDist = 1.6;
  const lineGeo = new THREE.BufferGeometry();
  const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(linesMesh);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const posAttr = pGeo.attributes.position;
  
  function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < COUNT; i++) {
      posAttr.array[i * 3]     += velocities[i].x;
      posAttr.array[i * 3 + 1] += velocities[i].y;
      posAttr.array[i * 3 + 2] += velocities[i].z;

      if (posAttr.array[i * 3] > 6 || posAttr.array[i * 3] < -6) velocities[i].x *= -1;
      if (posAttr.array[i * 3 + 1] > 6 || posAttr.array[i * 3 + 1] < -6) velocities[i].y *= -1;
      if (posAttr.array[i * 3 + 2] > 2 || posAttr.array[i * 3 + 2] < -2) velocities[i].z *= -1;
    }
    posAttr.needsUpdate = true;

    // Build connections
    const linePositions = [];
    for(let i=0; i<COUNT; i++) {
      for(let j=i+1; j<COUNT; j++) {
        const dx = posAttr.array[i*3] - posAttr.array[j*3];
        const dy = posAttr.array[i*3+1] - posAttr.array[j*3+1];
        const dz = posAttr.array[i*3+2] - posAttr.array[j*3+2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if(dist < connectDist) {
          linePositions.push(
            posAttr.array[i*3], posAttr.array[i*3+1], posAttr.array[i*3+2],
            posAttr.array[j*3], posAttr.array[j*3+1], posAttr.array[j*3+2]
          );
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    camera.position.x += (mx * 0.4 - camera.position.x) * 0.05;
    camera.position.y += (-my * 0.4 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const nW = window.innerWidth, nH = window.innerHeight;
    renderer.setSize(nW, nH);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
  });
}

/* ══════════════════════════════════════════════════════════════
   5. TEXT SCRAMBLE EFFECT
══════════════════════════════════════════════════════════════ */
function initTextScramble() {
  const el = document.getElementById('scramble-text');
  if (!el) return;

  const chars   = '!<>-_\\/[]{}—=+*^?#@$%&';
  const target  = 'Vijayaragavan R';
  let iteration = 0;
  let interval  = null;

  // Wait for loader to finish then scramble
  setTimeout(() => {
    interval = setInterval(() => {
      el.textContent = target.split('').map((char, idx) => {
        if (char === ' ') return ' ';
        if (idx < iteration) return target[idx];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');

      if (iteration >= target.length) clearInterval(interval);
      iteration += 0.5;
    }, 40);
  }, 2200);
}

/* ══════════════════════════════════════════════════════════════
   6. TYPED.JS — TYPEWRITER
══════════════════════════════════════════════════════════════ */
function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el || typeof Typed === 'undefined') return;

  new Typed('#typed-text', {
    strings: [
      'Textile Technologist',
      '3D Printing Specialist',
      'Manufacturing Engineer',
      'Problem Solver',
      'Career Progression Lead',
    ],
    typeSpeed:  55,
    backSpeed:  35,
    backDelay:  1800,
    loop:       true,
    cursorChar: '|',
  });
}

/* ══════════════════════════════════════════════════════════════
   7. COUNTER ANIMATIONS
══════════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.dataset.target);
      const decimal = el.dataset.decimal === 'true';
      const suffix  = el.dataset.suffix || '';
      let start     = 0;
      const duration = 1800;
      const step     = 16;
      const increment = target / (duration / step);

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          start = target;
          clearInterval(timer);
        }
        if (decimal) {
          // 821 → "8.21"
          el.textContent = (start / 100).toFixed(2) + suffix;
        } else {
          el.textContent = Math.floor(start) + suffix;
        }
      }, step);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ══════════════════════════════════════════════════════════════
   8. SKILL BAR ANIMATIONS
══════════════════════════════════════════════════════════════ */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar   = entry.target;
      const width = bar.dataset.width;
      // Small delay for visual cascade
      setTimeout(() => { bar.style.width = width + '%'; }, 200);
      observer.unobserve(bar);
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -60px 0px' });

  bars.forEach(b => observer.observe(b));
}

/* ══════════════════════════════════════════════════════════════
   9. MAGNETIC BUTTON EFFECT
══════════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const dx     = e.clientX - (rect.left + rect.width  / 2);
      const dy     = e.clientY - (rect.top  + rect.height / 2);
      const tx     = dx * 0.18;
      const ty     = dy * 0.18;
      btn.style.transform = `translate(${tx}px, ${ty}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   10. NAVBAR
══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('nav-drawer');
  const dClose    = document.getElementById('drawer-close');
  const navLinks  = document.querySelectorAll('.nav-links a, .nav-drawer a');

  // Scroll class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger toggle
  function openDrawer()  {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  if (dClose) dClose.addEventListener('click', closeDrawer);

  // Close drawer on link click
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  // Active nav highlight on scroll
  const sections   = document.querySelectorAll('section[id]');
  const observer   = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));
}

/* ══════════════════════════════════════════════════════════════
   11. BACK TO TOP
══════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════════════════════════
   12. PROJECT FILTER
══════════════════════════════════════════════════════════════ */
function initProjectFilter() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.project-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update active tab
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          requestAnimationFrame(() => {
            card.style.animation = 'fadeIn .4s ease forwards';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Inject the fadeIn keyframe once
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);
}

/* ══════════════════════════════════════════════════════════════
   13. CONTACT FORM
══════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const btn    = document.getElementById('form-submit-btn');
  if (!form || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('input-name').value.trim();
    const email   = document.getElementById('input-email').value.trim();
    const subject = document.getElementById('input-subject').value.trim();
    const message = document.getElementById('input-message').value.trim();

    // Front-end validation
    if (!name || !email || !message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Loading state
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        showStatus('✓ Message sent! I\'ll be in touch soon.', 'success');
        // Visual celebration
        btn.style.background = 'linear-gradient(135deg,#10B981,#059669)';
        btn.querySelector('.btn-label').textContent = '✓ Sent!';
        setTimeout(() => {
          form.reset();
          btn.style.background = '';
          btn.querySelector('.btn-label').textContent = 'Send Message';
        }, 4000);
      } else {
        const err = await res.json();
        showStatus(err.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch {
      showStatus('Network error. Is the backend server running? (node server.js)', 'error');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    btn.disabled = loading;
    const spinner = btn.querySelector('.btn-spinner');
    const arrow   = btn.querySelector('.btn-arrow');
    if (loading) {
      btn.querySelector('.btn-label').textContent = 'Sending...';
      if (spinner) spinner.style.display = 'block';
      if (arrow)   arrow.style.display   = 'none';
    } else {
      if (spinner) spinner.style.display = 'none';
      if (arrow)   arrow.style.display   = '';
    }
  }

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent  = msg;
    status.className    = `form-status ${type}`;
    setTimeout(() => {
      status.textContent = '';
      status.className   = 'form-status';
    }, 5000);
  }
}

/* ══════════════════════════════════════════════════════════════
   14. THEME TOGGLE
══════════════════════════════════════════════════════════════ */
function initThemeToggle() {
  const btn  = document.getElementById('theme-toggle');
  const root = document.documentElement;
  if (!btn) return;

  // Persist theme
  const saved = localStorage.getItem('rv-theme') || 'dark';
  root.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('rv-theme', next);
    window.dispatchEvent(new Event('themeChanged'));
  });
}

/* ══════════════════════════════════════════════════════════════
   15. LENIS SMOOTH SCROLL
══════════════════════════════════════════════════════════════ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  // Sync with GSAP ticker
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    // Fallback rAF loop
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
}

/* ══════════════════════════════════════════════════════════════
   16. GSAP SCROLL ANIMATIONS
══════════════════════════════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Parallax hero canvas
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    gsap.to(heroCanvas, {
      yPercent: 25, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // Section headings with clip-path wipe
  document.querySelectorAll('.section-title').forEach(el => {
    gsap.from(el, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

}

/* ══════════════════════════════════════════════════════════════
   17. AOS INIT
══════════════════════════════════════════════════════════════ */
function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 700,
    easing:   'ease-out-cubic',
    once:     true,
    offset:   80,
  });
}

/* ══════════════════════════════════════════════════════════════
   18. VANILLA TILT
══════════════════════════════════════════════════════════════ */
function initVanillaTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max:       8,
    speed:     400,
    glare:     true,
    'max-glare': 0.1,
    perspective: 1200,
  });
}

/* ══════════════════════════════════════════════════════════════
   19. KONAMI CODE EASTER EGG
══════════════════════════════════════════════════════════════ */
function initEasterEgg() {
  const code = [38,38,40,40,37,39,37,39,66,65];
  let pos    = 0;
  const overlay = document.getElementById('easter-egg');
  const closeBtn = document.getElementById('ee-close');

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === code[pos]) {
      pos++;
      if (pos === code.length) {
        pos = 0;
        if (overlay) overlay.classList.add('show');
        // Confetti burst
        launchConfetti();
      }
    } else {
      pos = 0;
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('show'));
  if (overlay)  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
}

function launchConfetti() {
  const colours = ['#5E35FF','#00D4FF','#EC4899','#F59E0B','#10B981'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;z-index:99999;pointer-events:none;
      left:${50 + (Math.random()-0.5)*40}%;
      top:${50 + (Math.random()-0.5)*20}%;
      width:8px;height:8px;border-radius:50%;
      background:${colours[Math.floor(Math.random()*colours.length)]};
      animation:confFly ${0.8+Math.random()*1.2}s ease-out forwards;
      transform-origin:center;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
  const sty = document.createElement('style');
  sty.textContent = '@keyframes confFly{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx,50px),var(--ty,-200px)) rotate(720deg) scale(0);opacity:0}}';
  document.head.appendChild(sty);
  // Set random direction for each
  document.querySelectorAll('[style*="confFly"]').forEach(el => {
    el.style.setProperty('--tx', `${(Math.random()-0.5)*200}px`);
    el.style.setProperty('--ty', `${-(80+Math.random()*200)}px`);
  });
}

/* ══════════════════════════════════════════════════════════════
   20. PARALLAX HERO SCROLL
══════════════════════════════════════════════════════════════ */
function initParallax() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      // Subtle parallax shift on hero title
      const heroContent = document.querySelector('.hero-content');
      if (heroContent && sy < window.innerHeight) {
        heroContent.style.transform = `translateY(${sy * 0.12}px)`;
        heroContent.style.opacity   = 1 - (sy / window.innerHeight) * 1.2;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   22. DAILY ROTATING QUOTES
══════════════════════════════════════════════════════════════ */
function initQuotes() {
  const textEl = document.getElementById('quote-text');
  const authEl = document.getElementById('quote-author');
  if (!textEl || !authEl) return;

  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Dreams don't work unless you do.", author: "John C. Maxwell" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas A. Edison" },
    { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "Fall seven times and stand up eight.", author: "Japanese Proverb" },
    { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "Thomas A. Edison" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett" },
    { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "An unexamined life is not worth living.", author: "Socrates" },
    { text: "Eighty percent of success is showing up.", author: "Woody Allen" },
    { text: "Every child is an artist. The problem is how to remain an artist once he grows up.", author: "Pablo Picasso" },
    { text: "You can never cross the ocean until you have the courage to lose sight of the shore.", author: "Christopher Columbus" },
    { text: "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.", author: "Maya Angelou" },
    { text: "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.", author: "Aristotle" },
    { text: "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.", author: "Henry Ford" },
    { text: "It's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
    { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
    { text: "Nothing is impossible, the word itself says, “I'm possible!”", author: "Audrey Hepburn" },
    { text: "Focusing your life solely on making a buck shows a fine poverty of ambition. Because it's only when you hitch your wagon to something larger than yourself that you realize your true potential.", author: "Barack Obama" },
    { text: "Either write something worth reading or do something worth writing.", author: "Benjamin Franklin" },
    { text: "First, have a definite, clear practical ideal; a goal, an objective. Second, have the necessary means to achieve your ends; wisdom, money, materials, and methods. Third, adjust all your means to that end.", author: "Aristotle" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Certain things catch your eye, but pursue only those that capture the heart.", author: "Ancient Indian Proverb" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Education costs money. But then so does ignorance.", author: "Sir Claus Moser" },
    { text: "Limitations live only in our minds. But if we use our imaginations, our possibilities become limitless.", author: "Jamie Paolinetti" },
    { text: "If you do what you’ve always done, you’ll get what you’ve always gotten.", author: "Tony Robbins" },
    { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
    { text: "It is never too late to be what you might have been.", author: "George Eliot" },
    { text: "A truly rich man is one whose children run into his arms when his hands are empty.", author: "Unknown" },
    { text: "We become what we think about.", author: "Earl Nightingale" },
    { text: "Remember that not getting what you want is sometimes a wonderful stroke of luck.", author: "Dalai Lama" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Do not let making a living prevent you from making a life.", author: "John Wooden" },
    { text: "To handle yourself, use your head; to handle others, use your heart.", author: "Eleanor Roosevelt" },
    { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman" },
    { text: "You define your own life. Don't let other people write your script.", author: "Oprah Winfrey" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "Malala Yousafzai" },
    { text: "At the end of the day, whether or not those people are comfortable with how you're living your life doesn't matter.", author: "Dr. Phil" },
    { text: "We generate fears while we sit. We overcome them by action.", author: "Dr. Henry Link" },
    { text: "Today's accomplishments were yesterday's impossibilities.", author: "Robert H. Schuller" },
    { text: "Light tomorrow with today.", author: "Elizabeth Barrett Browning" },
    { text: "The only difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
    { text: "Let us make our future now, and let us make our dreams tomorrow's reality.", author: "Malala Yousafzai" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Make each day your masterpiece.", author: "John Wooden" },
    { text: "Someday is a disease that will take your dreams to the grave with you.", author: "Timothy Ferriss" },
    { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
    { text: "Whatever you hold in your mind on a consistent basis is exactly what you will experience in your life.", author: "Tony Robbins" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
    { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
    { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
    { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
    { text: "I didn’t fail the test. I just found 100 ways to do it wrong.", author: "Benjamin Franklin" },
    { text: "When everything seems to be going against you, remember that the airplane takes off against the wind.", author: "Henry Ford" },
    { text: "Tough times never last, but tough people do.", author: "Robert H. Schuller" },
    { text: "Challenges are what make life interesting and overcoming them is what makes life meaningful.", author: "Joshua J. Marine" },
    { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.", author: "Earl Nightingale" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
    { text: "Someday is not a day of the week.", author: "Janet Dailey" },
    { text: "A winner is a dreamer who never gives up.", author: "Nelson Mandela" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
    { text: "The harder the conflict, the more glorious the triumph.", author: "Thomas Paine" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb" },
    { text: "Do not wait; the time will never be 'just right'.", author: "George Herbert" },
    { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
    { text: "Nothing great was ever achieved without enthusiasm.", author: "Ralph Waldo Emerson" },
    { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi" },
    { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
    { text: "Everything has beauty, but not everyone can see.", author: "Confucius" },
    { text: "He who has a why to live for can bear almost any how.", author: "Friedrich Nietzsche" },
    { text: "Only put off until tomorrow what you are willing to die having left undone.", author: "Pablo Picasso" },
    { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" }
  ];

  let currentIndex = parseInt(localStorage.getItem('rv-quote-index') || '0', 10);
  
  // Set current quote
  const q = quotes[currentIndex];
  textEl.textContent = `"${q.text}"`;
  authEl.textContent = `— ${q.author}`;

  // Advance index for next refresh
  currentIndex = (currentIndex + 1) % quotes.length;
  localStorage.setItem('rv-quote-index', currentIndex);
}

/* ══════════════════════════════════════════════════════════════
   DOMContentLoaded — BOOT EVERYTHING
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Init order matters
  initLoader();
  initAOS();
  initLenis();
  initGSAP();
  initThreeJS();
  initCursor();
  initTextScramble();
  initTyped();
  initCounters();
  initSkillBars();
  initMagneticButtons();
  initNavbar();
  initBackToTop();
  initProjectFilter();
  initContactForm();
  initThemeToggle();
  initScrollProgress();
  initEasterEgg();
  initParallax();
  initVanillaTilt();
  initQuotes();

  // Log signature
  console.log(
    '%c RVR Portfolio %c Built with ❤️ ',
    'background:#5E35FF;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:700',
    'background:#00D4FF;color:#030308;padding:4px 8px;border-radius:0 4px 4px 0;font-weight:700'
  );
});
