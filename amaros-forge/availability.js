/* ================================================================
   AMARO'S FORGE — availability.js
   Reads /settings/site from Firestore and updates the nav
   availability badge on all public pages.

   Loaded as <script type="module"> on every page.
   Cached in sessionStorage so Firestore is only hit once per session.
================================================================ */

import {
    getFirestore,
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { auth } from "./auth/firebase-config.js"; // ensures app is initialized

const CACHE_KEY = "af-availability";

async function checkAvailability() {
    // Check sessionStorage cache first
    const cached = sessionStorage.getItem(CACHE_KEY);
    let available = true; // default to available

    if (cached !== null) {
        available = cached === "true";
    } else {
        try {
            const db = getFirestore(getApp());
            const snap = await getDoc(doc(db, "settings", "site"));
            if (snap.exists()) {
                available = snap.data().available !== false;
            }
            sessionStorage.setItem(CACHE_KEY, String(available));
        } catch (e) {
            // Silently fail — nav stays as-is
            return;
        }
    }

    updateBadge(available);
}

function updateBadge(available) {
    document.querySelectorAll(".status-badge").forEach((badge) => {
        const dot = badge.querySelector(".status-dot");
        const text = badge.childNodes[badge.childNodes.length - 1];

        if (available) {
            if (dot) dot.style.background = "var(--terminal)";
            badge.style.color = "var(--terminal)";
            // Update text node
            badge.childNodes.forEach((n) => {
                if (n.nodeType === 3 && n.textContent.trim()) {
                    n.textContent = " AVAILABLE";
                }
            });
        } else {
            if (dot) dot.style.background = "var(--smoke)";
            badge.style.color = "var(--smoke)";
            badge.childNodes.forEach((n) => {
                if (n.nodeType === 3 && n.textContent.trim()) {
                    n.textContent = " BUSY";
                }
            });
        }
    });
}

checkAvailability();