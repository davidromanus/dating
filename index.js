// HaitianMeet marketing — small interactions. Zero deps.
// All visual flourishes are opt-in based on prefers-reduced-motion +
// IntersectionObserver feature detection.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Footer year stamp — done first so the JS still helps even if the rest
// of the script bails on an old browser.
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Scroll-reveal with cascading stagger ------------------
// We stagger reveals within the same container (.pillars__grid,
// .stats__grid, .checklist) so children fade in one after another
// instead of all at once. Delay is set inline via the --d CSS var.
(function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // Group cascading siblings to compute per-child delays
  const cascadeSelectors = ['.pillars__grid', '.stats__grid', '.checklist'];
  cascadeSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((group) => {
      const targets = group.matches('.checklist')
        ? group.querySelectorAll('li')
        : group.querySelectorAll('.reveal');
      targets.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--d', `${i * 90}ms`);
      });
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();

// ---------- Stats counter animation -------------------------------
// Animates from 0 → target when the stat enters the viewport.
// Reads the displayed text to get the target (e.g. "12+" → 12).
(function setupCounters() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const els = document.querySelectorAll('.stat__num');
  const parse = (txt) => {
    const m = txt.match(/(\d+)([+%]?)/);
    if (!m) return null;
    return { value: parseInt(m[1], 10), suffix: m[2] || '' };
  };

  const animate = (el) => {
    const parsed = parse(el.textContent);
    if (!parsed) return;
    const { value, suffix } = parsed;
    const duration = 1100;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.round(value * ease(t));
      el.textContent = `${v}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.5 }
  );
  els.forEach((el) => io.observe(el));
})();

// ---------- Lightweight scroll parallax on hero photos ------------
// rAF-throttled translateY based on scroll position. Capped distance
// so the photos never escape their container at the bottom of the
// hero section.
(function setupParallax() {
  if (reduceMotion) return;
  const main = document.querySelector('.hero__photo--main');
  const accent = document.querySelector('.hero__photo--accent');
  if (!main && !accent) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      // Stop parallax after the hero is well off-screen to save work
      if (y > 900) { ticking = false; return; }
      if (main) main.style.translate = `0 ${Math.min(y * 0.12, 60)}px`;
      if (accent) accent.style.translate = `0 ${Math.min(y * -0.18, 0) * -1 * -1 - Math.min(y * 0.18, 90)}px`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ---------- Top scroll progress bar -------------------------------
(function setupProgressBar() {
  if (reduceMotion) return;
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${pct}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
