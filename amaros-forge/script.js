/* ================================================================
   AMARO'S FORGE — script.js
   Modules:
     1. Custom Cursor
     2. Typewriter Effect
     3. Scroll Reveal (IntersectionObserver)
     4. Footer Year
================================================================ */

/* ----------------------------------------------------------------
   1. CUSTOM CURSOR
   — A small dot that snaps instantly to the mouse.
   — A larger ring that lerps (smoothly follows) behind it.
   — Both are hidden on mobile via CSS (see styles.css §15).
---------------------------------------------------------------- */
(function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (!dot || !ring) return; // Guard: elements might be missing

    let mouseX = 0, mouseY = 0; // Live mouse position
    let ringX = 0, ringY = 0; // Ring's lerped position

    // Snap the dot directly to the mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Lerp the ring toward the mouse each frame
    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();
})();


/* ----------------------------------------------------------------
   2. TYPEWRITER EFFECT
   — Cycles through an array of phrases.
   — Types forward, pauses, then deletes back.
   — To change the phrases, edit the `PHRASES` array below.
---------------------------------------------------------------- */
(function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    // ⚠️ EDIT THESE to change the rotating hero taglines
    const PHRASES = [
        'Websites forged to convert.',
        'Delivered fast. Unforgettable.',
        'Coded with precision.',
        'Your vision. Shipped.',
    ];

    const TYPING_SPEED_MS = 55;   // ms per character typed
    const DELETING_SPEED_MS = 28;  // ms per character deleted
    const PAUSE_AFTER_MS = 2200; // ms to pause when phrase is complete

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
        const current = PHRASES[phraseIndex];

        if (!isDeleting) {
            // Type forward
            charIndex++;
            el.textContent = current.slice(0, charIndex);

            if (charIndex === current.length) {
                // Phrase complete — pause, then start deleting
                isDeleting = true;
                setTimeout(tick, PAUSE_AFTER_MS);
                return;
            }
            setTimeout(tick, TYPING_SPEED_MS);

        } else {
            // Delete backward
            charIndex--;
            el.textContent = current.slice(0, charIndex);

            if (charIndex === 0) {
                // Phrase fully deleted — move to next
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
   3. SCROLL REVEAL
   — Any element with class="reveal" starts invisible.
   — Once it enters the viewport, class "visible" is added,
     triggering the CSS transition defined in styles.css §14.
   — Uses IntersectionObserver for performance (no scroll events).
---------------------------------------------------------------- */
(function initScrollReveal() {
    const THRESHOLD = 0.12; // How much of the element must be visible to trigger

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Fire once, then stop watching
            }
        });
    }, { threshold: THRESHOLD });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();


/* ----------------------------------------------------------------
   4. FOOTER YEAR
   — Automatically keeps the copyright year current.
   — No manual update needed each January.
---------------------------------------------------------------- */
(function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
})();