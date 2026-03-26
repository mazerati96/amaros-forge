/* ================================================================
   AMARO'S FORGE — script.js
   Modules:
     1. Custom Cursor
     2. Hamburger Menu (overlay toggle)
     3. Active Page Highlight
     4. Typewriter Effect (home page only)
     5. Scroll Reveal (IntersectionObserver)
     6. Footer Year
================================================================ */

/* ----------------------------------------------------------------
   1. CUSTOM CURSOR
   Dot snaps instantly. Ring lerps smoothly behind.
   Both seeded to viewport center so they're visible on load.
---------------------------------------------------------------- */
(function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    // Seed to viewport center — visible immediately before any mouse move
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    // Snap dot to exact mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Lerp ring smoothly behind the dot
    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }

    // Apply seed position immediately
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    animateRing();
})();


/* ----------------------------------------------------------------
   2. HAMBURGER MENU
   — Toggles .overlay-open on .nav-overlay
   — Toggles .is-open on .hamburger button
   — Toggles .menu-open on body (scroll lock)
   — Closes on Escape key or overlay link click
---------------------------------------------------------------- */
(function initHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('nav-overlay');
    if (!btn || !overlay) return;

    function openMenu() {
        btn.classList.add('is-open');
        overlay.classList.add('overlay-open');
        document.body.classList.add('menu-open');
        btn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        btn.classList.remove('is-open');
        overlay.classList.remove('overlay-open');
        document.body.classList.remove('menu-open');
        btn.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
        btn.classList.contains('is-open') ? closeMenu() : openMenu();
    }

    btn.addEventListener('click', toggleMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    overlay.querySelectorAll('.overlay-nav-link').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });
})();


/* ----------------------------------------------------------------
   3. ACTIVE PAGE HIGHLIGHT
   — Reads current filename, marks matching nav links.
---------------------------------------------------------------- */
(function initActivePage() {
    const path = window.location.pathname.replace(/^\//, '') || 'index.html';
    const page = path.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a').forEach((a) => {
        const href = a.getAttribute('href').replace(/^\//, '');
        if (href === page || (page === 'index.html' && href === 'index.html')) {
            a.classList.add('active');
        }
    });

    document.querySelectorAll('.overlay-nav-link').forEach((a) => {
        const href = a.getAttribute('href').replace(/^\//, '');
        if (href === page || (page === 'index.html' && href === 'index.html')) {
            a.classList.add('active-page');
        }
    });
})();


/* ----------------------------------------------------------------
   4. TYPEWRITER EFFECT
   — Only runs if #typewriter exists (home page only).
   — Edit the PHRASES array to change the rotating taglines.
---------------------------------------------------------------- */
(function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    // ⚠️ EDIT THESE to change the rotating hero taglines
    const PHRASES = [
        'Websites forged to convert.',
        'Dark. Fast. Unforgettable.',
        'Vibe-coded with precision.',
        'Your vision. Shipped.',
    ];

    const TYPING_SPEED_MS = 55;
    const DELETING_SPEED_MS = 28;
    const PAUSE_AFTER_MS = 2200;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
        const current = PHRASES[phraseIndex];
        if (!isDeleting) {
            charIndex++;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                isDeleting = true;
                setTimeout(tick, PAUSE_AFTER_MS);
                return;
            }
            setTimeout(tick, TYPING_SPEED_MS);
        } else {
            charIndex--;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % PHRASES.length;
                setTimeout(tick, 300);
                return;
            }
            setTimeout(tick, DELETING_SPEED_MS);
        }
    }

    tick();
})();


/* ----------------------------------------------------------------
   5. SCROLL REVEAL
---------------------------------------------------------------- */
(function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();


/* ----------------------------------------------------------------
   6. FOOTER YEAR
---------------------------------------------------------------- */
(function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
})();