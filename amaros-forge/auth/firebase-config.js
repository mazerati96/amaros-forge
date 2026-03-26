/* ================================================================
   AMARO'S FORGE — auth/firebase-config.js
   Firebase project: amaros-forge
   ================================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ----------------------------------------------------------------
// Firebase project credentials
// These are safe to commit — security is enforced by Auth +
// Firestore Rules, not by keeping these keys secret.
// ----------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyD0l33FgaKTy-xfWzF1sttK2WoZjgNcY9k",
    authDomain: "amaros-forge.firebaseapp.com",
    projectId: "amaros-forge",
    storageBucket: "amaros-forge.firebasestorage.app",
    messagingSenderId: "232522100425",
    appId: "1:232522100425:web:e8802c93dcf659aa9de718",
    measurementId: "G-QRZ3MDDEEC",  // optional — used by Analytics
};

// ----------------------------------------------------------------
// ⚠️ REPLACE: Set this to YOUR email address.
// Any login attempt from a different email is rejected immediately,
// even before Firebase is consulted.
// ----------------------------------------------------------------
export const AUTHORIZED_EMAIL = "amarosforge@gmail.com";

// ----------------------------------------------------------------
// Initialize Firebase + export auth instance
// ----------------------------------------------------------------
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ----------------------------------------------------------------
// Optional: uncomment to enable Firebase Analytics
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
// export const analytics = getAnalytics(app);
// ----------------------------------------------------------------