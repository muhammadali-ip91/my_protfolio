'use strict';
// CosmoFusion JS: merge of script.js + port.js behaviors

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const body = document.body;
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  const themeButtons = document.querySelectorAll('.theme-btn');
  const backToTopBtn = document.querySelector('.back-to-top');
  const heroOrbitHost = document.querySelector('.hero-orbit-logos');

  // Environment/Capability detection for performance-lite mode
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  const isNarrow = () => (window.innerWidth || document.documentElement.clientWidth || 0) < 768;
  let lowPower = prefersReduced || isMobileUA || !pointerFine || isNarrow();
  if (lowPower) body.classList.add('performance-lite');
  // Re-evaluate on resize to toggle performance-lite dynamically
  window.addEventListener('resize', () => {
    const nowLow = prefersReduced || isMobileUA || !pointerFine || isNarrow();
    if (nowLow !== lowPower) {
      lowPower = nowLow;
      body.classList.toggle('performance-lite', lowPower);
    }
  }, { passive: true });

  // Mobile menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
      hamburger.setAttribute('aria-expanded', String(!expanded));
    });

    // close on nav click
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }));
  }

  // Sticky/scrolled navbar
  const onScroll = () => {
    if (window.scrollY > 80) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    if (window.scrollY > 300) backToTopBtn?.classList.add('active');
    else backToTopBtn?.classList.remove('active');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href') || '';
      if (targetId === '#' || targetId.length < 2) return; // ignore plain '#'
      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        const offset = 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Open external links in a new tab (GitHub, LinkedIn, etc.)
  (function ensureExternalNewTab(){
    const anchors = document.querySelectorAll('a[href]');
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      // Only http/https (skip mailto:, tel:, and '#')
      if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
        try {
          const url = new URL(href, window.location.href);
          if (url.origin !== window.location.origin) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
          }
        } catch { /* ignore invalid urls */ }
      }
    });
  })();

  // Theme switching
  themeButtons.forEach(btn => btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    body.className = `${theme}-theme`;
    themeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    localStorage.setItem('cf-theme', theme);
  // Rebuild visuals that depend on theme colors
  if (typeof buildPath === 'function') setTimeout(() => buildPath(), 50);
  if (typeof window.__refreshExpOrbs === 'function') window.__refreshExpOrbs();
  if (typeof window.__contactRepaint === 'function') window.__contactRepaint();
  // Trigger dot glow recalculation by firing the scroll handler once
  if (typeof window.__onScrollDrawRef === 'function') setTimeout(() => window.__onScrollDrawRef(), 60);
  }));

  // Persist theme
  const savedTheme = localStorage.getItem('cf-theme');
  if (savedTheme) {
    body.className = `${savedTheme}-theme`;
    themeButtons.forEach(b => b.classList.toggle('active', b.dataset.theme === savedTheme));
  // ensure themed visuals match on load
  if (typeof window.__contactRepaint === 'function') setTimeout(() => window.__contactRepaint(), 0);
  if (typeof window.__refreshExpOrbs === 'function') setTimeout(() => window.__refreshExpOrbs(), 0);
  } else {
    themeButtons.forEach(b => b.classList.toggle('active', b.classList.contains('earth')));
  if (typeof window.__contactRepaint === 'function') setTimeout(() => window.__contactRepaint(), 0);
  }

  // Hero: orbiting logos around the core
  const heroIcons = [
    'fa-brands fa-html5',
    'fa-brands fa-css3-alt',
    'fa-brands fa-js',
    'fa-brands fa-react',
    'fa-brands fa-node-js',
    'fa-brands fa-git-alt',
    'fa-brands fa-docker',
    'fa-brands fa-github',
    'fa-brands fa-python',
    'fa-brands fa-sass',
    'fa-brands fa-bootstrap',
    'fa-brands fa-php',
    'fa-brands fa-laravel',
    'fa-brands fa-aws',
    'fa-brands fa-npm',
    'fa-brands fa-figma'
  ];
  const buildHeroOrbit = () => {
    if (!heroOrbitHost) return;
    heroOrbitHost.innerHTML = '';
    // ring that spins
    const ring = document.createElement('div');
    ring.className = 'ring';
    heroOrbitHost.appendChild(ring);
    // positions
    const box = heroOrbitHost.getBoundingClientRect();
    const cx = box.width / 2, cy = box.height / 2;
    const radius = Math.min(cx, cy) - 36; // leave padding
    const N = Math.min(14, heroIcons.length); // use unique icons only
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;
      const el = document.createElement('div');
      el.className = 'icon';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.innerHTML = `<i class="${heroIcons[i]}"></i>`;
      ring.appendChild(el);
    }
  };
  // initial & responsive
  if (heroOrbitHost) {
    const refreshHero = () => buildHeroOrbit();
    window.addEventListener('resize', () => setTimeout(refreshHero, 80));
    // ensure after layout and icon fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.finally(() => setTimeout(refreshHero, 0));
    } else {
      setTimeout(refreshHero, 0);
    }
    window.addEventListener('load', () => setTimeout(refreshHero, 50));
  }

  // Typing animation (responsive speeds + reduced-motion support)
  const typingElement = document.querySelector('.typing');
  if (typingElement) {
    const words = ['Web Developer', 'Python Developer', 'Frontend Engineer', 'Creative Coder'];
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = (window.innerWidth || 0) < 480;
    let typeSpeed = small ? 110 : 85;
    let delSpeed = small ? 65 : 50;
    let holdTime = 1100;
    if (typeof lowPower !== 'undefined' && lowPower) { typeSpeed += 25; delSpeed += 20; holdTime -= 100; }

    // Fallback: show the first word when reduced motion is requested
    if (reduced) {
      typingElement.textContent = words[0];
    } else {
      let wi = 0, ci = 0, del = false, tId;
      const step = () => {
        const w = words[wi];
        typingElement.textContent = del ? w.slice(0, ci--) : w.slice(0, ci++);
        typingElement.classList.toggle('is-deleting', !!del);
        if (!del && ci > w.length) {
          // pause at full word
          tId = setTimeout(() => { del = true; step(); }, holdTime);
          return;
        }
        if (del && ci < 0) {
          del = false; wi = (wi + 1) % words.length; ci = 0;
        }
        tId = setTimeout(step, del ? delSpeed : typeSpeed);
      };
      // pause/resume when tab not visible (saves battery)
      const vis = () => {
        if (document.hidden) { clearTimeout(tId); }
        else { clearTimeout(tId); tId = setTimeout(step, 250); }
      };
      document.addEventListener('visibilitychange', vis);
      setTimeout(step, 600);
    }
  }

  // Reveal animations
  const toAnimate = document.querySelectorAll('.animate-in');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transition = 'opacity .6s ease, transform .6s ease';
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: .15 });
  toAnimate.forEach(el => io.observe(el));

  // Skill bars
  const skillsSection = document.querySelector('#skills');
  const animatePanelBars = (root) => {
    root.querySelectorAll('.skill-progress').forEach(bar => {
      const w = bar.getAttribute('data-width') || '0';
      bar.style.width = w + '%';
    });
  };
  // Floating skills icons
  const floaterHost = document.querySelector('#skills .skills-floaters');
  // (skills orbit removed)
  const iconSets = {
    technical: [
      'fa-brands fa-html5','fa-brands fa-css3-alt','fa-brands fa-js','fa-brands fa-react','fa-solid fa-code','fa-brands fa-python','fa-brands fa-bootstrap','fa-brands fa-node-js'
    ],
    soft: [
      'fa-solid fa-comments','fa-solid fa-users','fa-regular fa-lightbulb','fa-regular fa-clock','fa-solid fa-brain','fa-solid fa-handshake','fa-solid fa-person-chalkboard'
    ],
    tools: [
      'fa-brands fa-git-alt','fa-solid fa-code','fa-brands fa-figma','fa-regular fa-image','fa-brands fa-github','fa-brands fa-npm','fa-solid fa-terminal'
    ]
  };
  const randomBetween = (min, max) => Math.random() * (max - min) + min;
  const populateFloaters = (key) => {
    if (!floaterHost) return;
    floaterHost.innerHTML = '';
    const base = iconSets[key] || iconSets.technical;
    // Keep a lighter animation on performance-lite instead of disabling
    const count = lowPower ? (window.innerWidth < 600 ? 5 : 7) : (window.innerWidth < 600 ? 10 : window.innerWidth < 992 ? 14 : 18);
    for (let i = 0; i < count; i++) {
      const iClass = base[i % base.length];
      const el = document.createElement('div');
      el.className = 'skills-floater';
      el.style.setProperty('--x', `${Math.round(randomBetween(4, 96))}vw`);
      el.style.setProperty('--sx', `${Math.round(randomBetween(-20, 20))}px`);
      // Slightly slower on lowPower, but keep running
      el.style.setProperty('--dur', `${(lowPower ? randomBetween(18, 28) : randomBetween(12, 22)).toFixed(1)}s`);
      if (lowPower) el.style.opacity = '.20';
      el.style.animationDelay = `-${randomBetween(0, 12).toFixed(1)}s`;
      el.innerHTML = `<i class="${iClass}"></i>`;
      floaterHost.appendChild(el);
    }
  };
  // (skills orbit removed)
  if (skillsSection) {
    const sio = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const activePanel = skillsSection.querySelector('.skills-panel.active') || skillsSection;
        animatePanelBars(activePanel);
        sio.unobserve(skillsSection);
      }
    }, { threshold: .2 });
    sio.observe(skillsSection);

    // Tabs
    const tabs = skillsSection.querySelectorAll('.skills-tab');
    const panels = skillsSection.querySelectorAll('.skills-panel');
    tabs.forEach(tab => tab.addEventListener('click', () => {
      // activate tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // show panel
      const id = tab.dataset.target;
      panels.forEach(p => {
        const isTarget = p.id === id;
        p.classList.toggle('active', isTarget);
        p.toggleAttribute('hidden', !isTarget);
        if (isTarget) animatePanelBars(p);
      });
    // switch floaters (orbit removed)
    if (id === 'tab-technical') { populateFloaters('technical'); }
    else if (id === 'tab-soft') { populateFloaters('soft'); }
    else if (id === 'tab-tools') { populateFloaters('tools'); }
    }));
  }

  // initial floaters for default active tab
  if (floaterHost) populateFloaters('technical');
  // (orbit removed)

  // Skills: Magnetic hover + Staggered entrance
  const skillCards = document.querySelectorAll('#skills .skill-card');
  // 3D Tilt + glare (if library present and device supports hover)
  if (!lowPower && pointerFine && window.VanillaTilt && skillCards.length) {
    skillCards.forEach(card => {
      window.VanillaTilt.init(card, { max: 10, speed: 400, glare: true, 'max-glare': .15, scale: 1.02 });
    });
  }
  // Magnetic hover similar to projects
  if (pointerFine && !lowPower) skillCards.forEach(card => {
    let rafId;
    const strength = 12;
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const tx = Math.max(-1, Math.min(1, dx)) * strength;
      const ty = Math.max(-1, Math.min(1, dy)) * strength;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.classList.add('is-magnet');
        card.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(rafId);
      card.style.transform = '';
      card.classList.remove('is-magnet');
    };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });

  // Staggered entrance for skills
  const skillIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const index = [...skillCards].indexOf(e.target);
        e.target.style.transitionDelay = `${index * 70}ms`;
        e.target.classList.add('is-inview');
        skillIO.unobserve(e.target);
      }
    });
  }, { threshold: .15 });
  skillCards.forEach(c => skillIO.observe(c));

  // Projects filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  filterBtns.forEach(b => b.addEventListener('click', () => {
    filterBtns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.filter;
    cards.forEach(c => c.style.display = (f === 'all' || c.dataset.category === f) ? 'block' : 'none');
  }));

  // Certificates slider (buttons scroll container)
  const certSlider = document.querySelector('.certificates-slider');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  if (certSlider && prevBtn && nextBtn) {
    const getStep = () => (certSlider.querySelector('.certificate-card')?.clientWidth || 320) + 18;
    prevBtn.addEventListener('click', () => certSlider.scrollBy({ left: -getStep(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => certSlider.scrollBy({ left:  getStep(), behavior: 'smooth' }));
  }

  // Download CV (demo)
  document.querySelector('.download-cv')?.addEventListener('click', e => {
    e.preventDefault();
    alert('Downloading CV... (demo)');
  });

  // Contact form -> Firebase Realtime Database
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const name = form.querySelector('#contact-name')?.value?.trim() || '';
      const email = form.querySelector('#contact-email')?.value?.trim() || '';
      const subject = form.querySelector('#contact-subject')?.value?.trim() || '';
      const message = form.querySelector('#contact-message')?.value?.trim() || '';
      if (!name || !email || !message) {
        alert('Please fill in name, email, and message.');
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      const prev = btn?.textContent;
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      try {
        // Prefer ESM export; fallback to global ContactAPI if needed
        const api = window.ContactAPI;
        if (!api || typeof api.saveContact !== 'function') throw new Error('ContactAPI not available');
        await api.saveContact({ name, email, subject, message });
        alert('Message sent!');
        form.reset();
      } catch (err) {
        console.error('Contact save failed:', err);
        alert('Failed to send. Please try again.');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = prev || 'Send Message'; }
      }
    });
  }
  document.querySelector('.newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Thanks for subscribing! (demo)');
    e.currentTarget.reset();
  });

  // Experience: Glass tilt + SVG neon path reveal + expanding cards + scroll focus
  const expSection = document.querySelector('#experience');
  const timelineWrap = expSection?.querySelector('.timeline-wrap');
  const timelineEl = expSection?.querySelector('.timeline');
  const svgEl = expSection?.querySelector('.timeline-svg');
  const expCards = expSection?.querySelectorAll('.exp-card') || [];

  // 1) Tilt for cards (VanillaTilt)
  if (!lowPower && pointerFine && window.VanillaTilt && expCards.length) {
    expCards.forEach(card => {
      window.VanillaTilt.init(card, {
        max: 8,
        speed: 400,
        glare: true,
        'max-glare': 0.25,
        scale: 1.02,
      });
    });
  }

  // 2) Build SVG path following the centers of timeline-dots; progress based on window scroll
  const buildPath = () => {
    if (!svgEl || !timelineEl) return;
    // Clear
    svgEl.innerHTML = '';
    const dots = [...timelineEl.querySelectorAll('.timeline-dot')];
    if (!dots.length) return;

  // Compute relative positions within SVG aligned to the .timeline box
  const wrapRect = timelineWrap.getBoundingClientRect();
  const tlRect = timelineEl.getBoundingClientRect();
  // Position and size the SVG to exactly cover the timeline area
  svgEl.style.left = `${tlRect.left - wrapRect.left}px`;
  svgEl.style.top = `${tlRect.top - wrapRect.top}px`;
  svgEl.style.width = `${tlRect.width}px`;
  svgEl.style.height = `${tlRect.height}px`;
    const createPoint = (el) => {
      const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2 - tlRect.left;
  const y = r.top + r.height / 2 - tlRect.top;
      return { x, y };
    };
  // Straight vertical line offset from the center so it does not touch dots
  const centerX = tlRect.width / 2;
  const offsetPx = 0; // keep line exactly at center
  const x = Math.round(centerX - offsetPx);
  const top = 0;
  const bottom = tlRect.height;
  const d = `M ${x},${top} L ${x},${bottom}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
  const themeEl = timelineWrap || document.body;
  const primaryColor = getComputedStyle(themeEl).getPropertyValue('--primary').trim() || '#4ecca3';
  path.setAttribute('stroke', primaryColor);
  path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('filter', 'url(#glow)');
  // Hide the SVG line to avoid doubling with the CSS center line; keep for progress math
  path.style.opacity = '0';

    // defs for glow
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    const feGaussian = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussian.setAttribute('stdDeviation', '3');
    feGaussian.setAttribute('result', 'coloredBlur');
    filter.appendChild(feGaussian);
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feMerge);
    defs.appendChild(filter);

  svgEl.setAttribute('viewBox', `0 0 ${tlRect.width} ${tlRect.height}`);
    svgEl.appendChild(defs);
    svgEl.appendChild(path);

    // Animate draw on scroll via stroke-dashoffset
    const pathLen = path.getTotalLength();
    path.style.strokeDasharray = `${pathLen}`;
    path.style.strokeDashoffset = `${pathLen}`;

    const onScrollDraw = () => {
      // Progress based on vertical position through the experience section
      const secRect = expSection.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const start = secRect.top + window.scrollY - vh * 0.15; // start slightly before entering
      const end = secRect.bottom + window.scrollY - vh * 0.85; // finish slightly after leaving
      const max = Math.max(1, end - start);
      const raw = (window.scrollY - start) / max;
      const prog = Math.min(1, Math.max(0, raw));
      path.style.strokeDashoffset = `${pathLen * (1 - prog)}`;
      // light up dots progressively
      dots.forEach((dot, i) => {
        const threshold = (i + 1) / dots.length;
        dot.classList.toggle('lit', prog >= threshold - 0.02);
      });
    };
    // Remove previous handler if present to avoid duplicates
    if (window.__onScrollDrawRef) {
      window.removeEventListener('scroll', window.__onScrollDrawRef);
    }
    window.__onScrollDrawRef = onScrollDraw;
    window.addEventListener('scroll', onScrollDraw, { passive: true });
    onScrollDraw();
  };

  // Recompute path on resize or theme change
  const ro = new ResizeObserver(() => buildPath());
  if (timelineWrap) ro.observe(timelineWrap);
  let rebuildTO;
  window.addEventListener('resize', () => { clearTimeout(rebuildTO); rebuildTO = setTimeout(buildPath, 120); });
  if (timelineWrap) setTimeout(buildPath, 120);
  window.addEventListener('load', () => setTimeout(buildPath, 150));

  // 3) Expanding cards: auto-expand on hover; click opens; keyboard toggles
  expCards.forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');

    const openCard = () => {
      if (!card.classList.contains('is-open')) {
        card.classList.add('is-open');
        card.setAttribute('aria-expanded', 'true');
        // wait for CSS max-height transition to finish
        setTimeout(buildPath, 420);
      }
    };
    const closeCard = () => {
      if (card.classList.contains('is-open')) {
        card.classList.remove('is-open');
        card.setAttribute('aria-expanded', 'false');
        setTimeout(buildPath, 420);
      }
    };
    const toggle = () => {
      if (card.classList.contains('is-open')) closeCard(); else openCard();
    };

    // Pointer interactions
    card.addEventListener('mouseenter', openCard);
    card.addEventListener('mouseleave', closeCard);
    // Click opens (don’t toggle) to avoid fighting hover state
    card.addEventListener('click', openCard);
    // Keyboard accessibility: Enter/Space toggles
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // 4) Window-scroll focus + dim others
  if (timelineWrap) {
    const items = [...timelineWrap.querySelectorAll('.timeline-item')];
    const setFocus = () => {
      const centerY = window.scrollY + (window.innerHeight || document.documentElement.clientHeight) / 2;
      let best = null, bestDist = Infinity;
      items.forEach(it => {
        const r = it.getBoundingClientRect();
        const y = r.top + window.scrollY + r.height / 2;
        const d = Math.abs(y - centerY);
        if (d < bestDist) { bestDist = d; best = it; }
      });
      items.forEach(it => it.classList.toggle('is-focus', it === best));
      items.forEach(it => it.classList.toggle('is-dim', it !== best));
    };
    window.addEventListener('scroll', setFocus, { passive: true });
    setTimeout(setFocus, 120);
  }

  // 5) Spawn background orbs in .timeline-bg
  const bg = expSection?.querySelector('.timeline-bg');
  window.__refreshExpOrbs = () => {
    if (!bg) return;
    bg.querySelectorAll('.orb').forEach(n => n.remove());
    const count = window.innerWidth < 600 ? 5 : 9;
    for (let i = 0; i < count; i++) {
      const orb = document.createElement('span');
      orb.className = 'orb';
      const size = Math.round(40 + Math.random() * 120);
      orb.style.width = `${size}px`;
      orb.style.height = `${size}px`;
      orb.style.left = `${Math.round(Math.random() * 100)}%`;
      orb.style.bottom = `${Math.round(Math.random() * 10)}%`;
  const themeEl = timelineWrap || document.body;
  const primary = getComputedStyle(themeEl).getPropertyValue('--primary').trim();
      orb.style.background = `radial-gradient(circle, ${primary} 0%, transparent 70%)`;
      orb.style.setProperty('--t', `${16 + Math.random() * 14}s`);
      bg.appendChild(orb);
    }
  };
  if (bg) window.__refreshExpOrbs();

  // Projects: Tilt, Magnetic hover, Staggered entrance
  const projectCards = document.querySelectorAll('.project-card');
  // Tilt via VanillaTilt on the inner wrapper for smoother effect
  projectCards.forEach(card => {
    const inner = card.querySelector('.card-tilt') || card;
    if (!lowPower && pointerFine && window.VanillaTilt) {
      window.VanillaTilt.init(inner, { max: 10, speed: 400, glare: true, 'max-glare': .15, scale: 1.02 });
    }
  });

  // Magnetic hover: small translate toward cursor
  if (pointerFine && !lowPower) projectCards.forEach(card => {
    let rafId;
    const strength = 16; // px
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const tx = Math.max(-1, Math.min(1, dx)) * strength;
      const ty = Math.max(-1, Math.min(1, dy)) * strength;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.classList.add('is-magnet');
        card.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(rafId);
      card.style.transform = '';
      card.classList.remove('is-magnet');
    };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });

  // Staggered entrance using IntersectionObserver
  const projIO = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const delay = [...projectCards].indexOf(e.target) * 90;
        e.target.style.transitionDelay = `${delay}ms`;
        e.target.classList.add('is-inview');
        projIO.unobserve(e.target);
      }
    });
  }, { threshold: .2 });
  projectCards.forEach(c => projIO.observe(c));

  // Projects: View button opens image modal
  const projectModal = document.querySelector('.project-modal');
  const projectModalImg = projectModal?.querySelector('img');
  const projectModalClose = projectModal?.querySelector('.close-modal');
  document.querySelectorAll('.project-card .overlay-actions .btn-mini').forEach(btn => {
    const label = (btn.textContent || '').trim().toLowerCase();
    if (label === 'view') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.project-card');
        const img = card?.querySelector('.project-image img');
        const src = img?.getAttribute('src');
        if (src && projectModal && projectModalImg) {
          projectModalImg.src = src;
          projectModal.classList.add('active');
          projectModal.setAttribute('aria-hidden', 'false');
        }
      });
    } else if (label === 'github' || label === 'live') {
      // Leave behavior to user-provided links later; for placeholders prevent jumping to '#'
      btn.addEventListener('click', (e) => {
        const href = btn.getAttribute('href') || '#';
        if (href === '#') e.preventDefault();
      });
    }
  });
  const closeProjectModal = () => {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
  };
  projectModalClose?.addEventListener('click', closeProjectModal);
  projectModal?.addEventListener('click', (e) => { if (e.target === projectModal) closeProjectModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProjectModal(); });

  // Certificates: flip (CSS), modal zoom, stagger in, lightweight carousel scroll
  // Note: reuse certSlider declared above for prev/next buttons to avoid duplicate const
  const certCards = document.querySelectorAll('.certificate-card');
  const certModal = document.querySelector('.cert-modal');
  const certModalImg = certModal?.querySelector('img');
  const certModalClose = certModal?.querySelector('.close-modal');
  // Stagger in
  const certIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const index = [...certCards].indexOf(e.target);
        e.target.style.transitionDelay = `${index * 90}ms`;
        e.target.classList.add('is-inview');
        certIO.unobserve(e.target);
      }
    });
  }, { threshold: .2 });
  certCards.forEach(c => certIO.observe(c));

  // Modal
  // Do not open on full card click (mirror Projects behavior: only View button opens)
  const closeModal = () => {
    if (!certModal) return;
    certModal.classList.remove('active');
    certModal.setAttribute('aria-hidden', 'true');
  };
  certModalClose?.addEventListener('click', closeModal);
  certModal?.addEventListener('click', (e) => { if (e.target === certModal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Certificates: View button opens modal (robust delegation + overlay click support)
  document.addEventListener('click', (e) => {
  const viewTrigger = e.target.closest('.cert-view, .cert-overlay');
  if (!viewTrigger) return;
  // If it's overlay but not a button, only trigger when clicking non-interactive area
  if (viewTrigger.classList.contains('cert-overlay') && e.target.closest('button,a')) {
    return; // let the actual button handle it
  }
  e.preventDefault();
  const card = viewTrigger.closest('.certificate-card');
  if (!card) return;
  const imageEl = card.querySelector('img');
  let src = null;
  let alt = 'Certificate';

  // Prefer data attributes on the button if present
  const btn = e.target.closest('.cert-view');
  if (btn) {
    src = btn.getAttribute('data-img') || btn.dataset.img || null;
    alt = btn.getAttribute('data-alt') || btn.dataset.alt || alt;
  }
  if (!src && imageEl) {
    src = imageEl.getAttribute('src');
    alt = imageEl.getAttribute('alt') || alt;
  }
  if (!src) return;
  if (certModal && certModalImg) {
    certModalImg.src = src;
    certModalImg.alt = alt;
    certModal.classList.add('active');
    certModal.setAttribute('aria-hidden', 'false');
  }
  });

  // Lightweight carousel: horizontal drag/scroll with inertia
  if (certSlider) {
    let isDown = false, startX = 0, scrollLeft = 0, vel = 0, raf;
    const onDown = (e) => { isDown = true; startX = (e.touches?.[0]?.pageX || e.pageX); scrollLeft = certSlider.scrollLeft; cancelAnimationFrame(raf); };
    const onMove = (e) => {
      if (!isDown) return;
      const x = (e.touches?.[0]?.pageX || e.pageX);
      const walk = (x - startX) * 1.2;
      const prev = certSlider.scrollLeft;
      certSlider.scrollLeft = scrollLeft - walk;
      vel = lowPower ? 0 : (certSlider.scrollLeft - prev);
    };
    const momentum = () => {
      if (lowPower) return; // skip inertia on low-power to reduce RAF load
      certSlider.scrollLeft += vel;
      vel *= 0.95;
      if (Math.abs(vel) > 0.5) raf = requestAnimationFrame(momentum);
    };
    const onUp = () => { isDown = false; cancelAnimationFrame(raf); if (!lowPower) momentum(); };
    certSlider.addEventListener('mousedown', onDown);
    certSlider.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    certSlider.addEventListener('touchstart', onDown, { passive: true });
    certSlider.addEventListener('touchmove', onMove, { passive: true });
    certSlider.addEventListener('touchend', onUp);
  }

  // Contact section enhancements
  const contactSection = document.querySelector('#contact');
  if (contactSection) {
    // 1) Floating glow orbs
    const cBg = contactSection.querySelector('.contact-bg');
  const paintContactOrbs = () => {
      if (!cBg) return;
      cBg.innerHTML = '';
      const count = window.innerWidth < 600 ? 6 : window.innerWidth < 992 ? 9 : 12;
      for (let i = 0; i < count; i++) {
        const orb = document.createElement('span');
        orb.className = 'orb';
        const size = Math.round(60 + Math.random() * 160);
        orb.style.width = `${size}px`;
        orb.style.height = `${size}px`;
        orb.style.left = `${Math.round(Math.random() * 100)}%`;
        orb.style.top = `${Math.round(Math.random() * 100)}%`;
    const scope = contactSection || document.body;
    const primary = getComputedStyle(scope).getPropertyValue('--primary').trim() || '#4ecca3';
        orb.style.background = `radial-gradient(circle at 30% 30%, ${primary}, transparent 60%)`;
        orb.style.setProperty('--t', `${18 + Math.random() * 12}s`);
        cBg.appendChild(orb);
      }
    };
  paintContactOrbs();
    window.addEventListener('resize', () => { clearTimeout(window.__c_orb_to); window.__c_orb_to = setTimeout(paintContactOrbs, 120); });

  // 2) (social orbit removed — using single-row links)

    // 3) Ripple button interaction
    document.querySelectorAll('.ripple-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX || (e.touches?.[0]?.clientX ?? r.left + r.width/2)) - r.left;
        const y = (e.clientY || (e.touches?.[0]?.clientY ?? r.top + r.height/2)) - r.top;
        btn.style.setProperty('--rx', x + 'px');
        btn.style.setProperty('--ry', y + 'px');
        btn.classList.remove('is-rippling');
        // force reflow to restart animation
        void btn.offsetWidth;
        btn.classList.add('is-rippling');
        setTimeout(() => btn.classList.remove('is-rippling'), 650);
      });
    });

    // 4) Scroll fade-in for contact info + form
    const cIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview');
          cIO.unobserve(e.target);
        }
      });
    }, { threshold: .2 });
  contactSection.querySelectorAll('.animate-in').forEach(el => cIO.observe(el));

    // 5) Cursor-follow glow
    const form = contactSection.querySelector('.contact-form');
    if (form) {
      const setVars = (el, e) => {
        const r = el.getBoundingClientRect();
        const x = Math.round(((e.clientX || 0) - r.left) / r.width * 100);
        const y = Math.round(((e.clientY || 0) - r.top) / r.height * 100);
        el.style.setProperty('--mx', x + '%');
        el.style.setProperty('--my', y + '%');
      };
      form.addEventListener('mousemove', (e) => { setVars(form, e); form.classList.add('hover-glow'); }, { passive: true });
      form.addEventListener('mouseleave', () => form.classList.remove('hover-glow'));
      // inputs/textarea
      form.querySelectorAll('input, textarea').forEach((el) => {
        el.addEventListener('mousemove', (e) => setVars(el, e), { passive: true });
      });
    }

  // theme repaint: only refresh orbs now
  window.__contactRepaint = () => { paintContactOrbs(); };
  }
  
  // Dynamic Galaxy Starfield (canvas background)
  // ------------------------------------------------------------------
  (function initStarfield(){
    // Skip canvas starfield entirely on performance-lite devices
    if (lowPower) return;
    try{
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
      const canvas = document.createElement('canvas');
      canvas.className = 'starfield';
      canvas.setAttribute('aria-hidden', 'true');
      // Insert after base stars so it sits between star layers and other content
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d', { alpha: true });

  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      let w = 0, h = 0;
  const stars = []; // {x,y,r,sp,twF,twP,twA,baseA,layer,vx,vy}
      const meteors = []; // {x,y,vx,vy,len,life,maxLife}
      const layers = 3; // depth layers for parallax
  const baseDensity = 0.00006; // reduce base density slightly
  const densityScale = (isMobile ? 0.35 : 0.8) * (dpr > 1.5 ? 0.75 : 1);

  function resize(){
        const rect = document.body.getBoundingClientRect();
        w = Math.round(rect.width);
        h = Math.round(Math.max(rect.height, window.innerHeight || 800));
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        // rebuild star field on resize for crispness
        stars.length = 0;
        const count = Math.round(w * h * baseDensity * densityScale * (reduced ? 0.6 : 1));
        for (let i = 0; i < count; i++){
          const layer = (i % layers) + 1; // 1..layers
          const r = (Math.random() * 0.8 + 0.2) * layer; // radius per depth
          const sp = (Math.random() * 0.08 + 0.03) * layer * (isMobile ? 0.6 : 0.9); // slower drift
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r,
            sp,
            twF: 0.8 + Math.random() * 1.6,    // twinkle frequency
            twP: Math.random() * Math.PI * 2,  // phase
            twA: 0.3 + Math.random() * 0.7,    // amplitude
            baseA: 0.35 + Math.random() * 0.55,// base alpha
            layer,
            vx: 0,
            vy: 0
          });
        }
      }

      // Mouse parallax target
      let targetPar = {x: 0, y: 0}, curPar = {x: 0, y: 0};
      const mouse = { x: null, y: null, active: false };
      function setMouse(x, y){ mouse.x = x; mouse.y = y; mouse.active = true; }
      window.addEventListener('mousemove', (e) => {
        const cx = (window.innerWidth || w) / 2;
        const cy = (window.innerHeight || h) / 2;
        const dx = (e.clientX - cx) / cx; // -1..1
        const dy = (e.clientY - cy) / cy;
        targetPar.x = dx * 8; // px offset
        targetPar.y = dy * 6;
        setMouse(e.clientX, e.clientY);
      }, { passive: true });
      window.addEventListener('mouseleave', () => { mouse.active = false; });
      window.addEventListener('touchstart', (e) => { const t=e.touches[0]; if (t) setMouse(t.clientX, t.clientY); }, { passive: true });
      window.addEventListener('touchmove', (e) => { const t=e.touches[0]; if (t) setMouse(t.clientX, t.clientY); }, { passive: true });
      window.addEventListener('touchend', () => { mouse.active = false; }, { passive: true });

      function spawnMeteor(){
        if (reduced) return;
        const fromRight = Math.random() > 0.5;
        const x = fromRight ? w + 80 : Math.random() * w * 0.6;
        const y = fromRight ? Math.random() * h * 0.3 : -40;
  const speed = 6 + Math.random() * 8; // slightly slower
        const angle = fromRight ? (Math.PI * 0.9) : (Math.PI * 1.1);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        meteors.push({ x, y, vx, vy, len: 140 + Math.random() * 120, life: 0, maxLife: 60 + Math.random() * 30 });
      }

      let lastSpawn = 0;
      function tick(t){
        requestAnimationFrame(tick);
  const spawnGap = reduced ? 16000 : isMobile ? 11000 : 6000; // fewer meteors overall
        if (t - lastSpawn > spawnGap + Math.random()*3000){
          spawnMeteor();
          lastSpawn = t;
        }
        // smooth parallax
        curPar.x += (targetPar.x - curPar.x) * 0.04;
        curPar.y += (targetPar.y - curPar.y) * 0.04;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        // Stars
  const influenceR = reduced ? 80 : (isMobile ? 110 : 150); // px
        const influenceR2 = influenceR * influenceR;
  const strength = reduced ? 0.07 : (isMobile ? 0.11 : 0.16); // acceleration magnitude
        const damping = 0.94; // velocity damping
        for (let i = 0; i < stars.length; i++){
          const s = stars[i];
          // gentle drift
          s.y += s.sp * (reduced ? 0.3 : 1);

          // attraction to cursor
          if (mouse.active && mouse.x != null && mouse.y != null){
            const ox = curPar.x * (s.layer * 0.25);
            const oy = curPar.y * (s.layer * 0.25);
            const sx = s.x + ox;
            const sy = s.y + oy;
            const dx = (mouse.x - sx);
            const dy = (mouse.y - sy);
            const d2 = dx*dx + dy*dy;
            if (d2 < influenceR2){
              const d = Math.sqrt(d2) || 1;
              const falloff = 1 - (d / influenceR);
              const ax = (dx / d) * strength * falloff * (s.layer * 0.3);
              const ay = (dy / d) * strength * falloff * (s.layer * 0.3);
              s.vx += ax;
              s.vy += ay;
            }
          }

          // apply velocity with damping
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= damping;
          s.vy *= damping;

          if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
          const ox = curPar.x * (s.layer * 0.25);
          const oy = curPar.y * (s.layer * 0.25);
          const tw = s.baseA + Math.sin((performance.now()/1000) * s.twF + s.twP) * 0.2 * s.twA;
          const a = Math.max(0, Math.min(1, tw));
          // glow halo
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${0.06 * s.layer})`;
          ctx.arc(s.x + ox, s.y + oy, s.r * 2.2, 0, Math.PI*2);
          ctx.fill();
          // core
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.arc(s.x + ox, s.y + oy, Math.max(0.6, s.r), 0, Math.PI*2);
          ctx.fill();
        }

        // Meteors
        for (let i = meteors.length - 1; i >= 0; i--){
          const m = meteors[i];
          m.x += m.vx;
          m.y += m.vy;
          m.life++;
          const p = 1 - (m.life / m.maxLife);
          const alpha = Math.max(0, Math.min(1, p));
          ctx.strokeStyle = `rgba(255,255,255,${0.35 * alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * (m.len/10), m.y - m.vy * (m.len/10));
          ctx.stroke();
          if (m.life > m.maxLife || m.x < -200 || m.y > h + 200){
            meteors.splice(i, 1);
          }
        }
      }

      resize();
      let resizeTO;
      window.addEventListener('resize', () => { clearTimeout(resizeTO); resizeTO = setTimeout(resize, 120); });
      requestAnimationFrame(tick);
    }catch(err){
      // fail silently; background remains static
      console.error('Starfield init failed:', err);
    }
  })();
});
// End of app.js