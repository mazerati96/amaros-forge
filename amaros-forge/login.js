/* ================================================================
   AMARO'S FORGE — login.js

   Handles all login page interactivity:
     - Tab switching (Sign In ↔ Reset Password)
     - Password visibility toggle
     - Sign in form submission → Firebase Auth
     - Password reset form submission → Firebase Auth
     - Redirect to dashboard on successful login
     - Redirect already-logged-in users straight to dashboard
================================================================ */

import { signInCreator, sendPasswordReset, onAuthReady } from "./auth/auth.js";
import { AUTHORIZED_EMAIL } from "./auth/firebase-config.js";

/* ── REDIRECT IF ALREADY LOGGED IN ─────────────────────────────
   If the user is already authenticated, skip the login page
   and send them straight to the dashboard.
──────────────────────────────────────────────────────────────── */
onAuthReady((user) => {
    if (user && user.email.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase()) {
        window.location.replace("/dashboard/index.html");
    }
});

/* ── ELEMENT REFS ────────────────────────────────────────────── */
const card = document.getElementById("login-card");

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

// Sign-in panel
const loginEmail = document.getElementById("login-email");
const loginPw = document.getElementById("login-password");
const loginError = document.getElementById("login-error");
const btnSignIn = document.getElementById("btn-sign-in");
const togglePw = document.getElementById("toggle-pw");

// Reset panel
const resetEmail = document.getElementById("reset-email");
const resetError = document.getElementById("reset-error");
const resetSuccess = document.getElementById("reset-success");
const btnReset = document.getElementById("btn-reset");
const btnBackLogin = document.getElementById("btn-back-to-login");

/* ── HELPERS ─────────────────────────────────────────────────── */

/** Show an error message box */
function showError(el, msg) {
    el.textContent = msg;
    el.className = "message-box error";
}

/** Show a success message box */
function showSuccess(el, msg) {
    el.textContent = msg;
    el.className = "message-box success";
}

/** Clear a message box */
function clearMsg(el) {
    el.textContent = "";
    el.className = "message-box";
}

/** Set a button to loading state */
function setLoading(btn, isLoading) {
    btn.disabled = isLoading;
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "// Processing...";
        btn.classList.add("loading");
    } else {
        btn.textContent = btn.dataset.originalText || btn.textContent;
        btn.classList.remove("loading");
    }
}

/** Shake the card (wrong password feedback) */
function shakeCard() {
    card.classList.remove("shake");
    void card.offsetWidth;             // force reflow to restart animation
    card.classList.add("shake");
    card.addEventListener("animationend", () => card.classList.remove("shake"), { once: true });
}

/* ── TAB SWITCHER ────────────────────────────────────────────── */
tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.tab;

        // Update buttons
        tabBtns.forEach((b) => {
            b.classList.toggle("active", b.dataset.tab === target);
            b.setAttribute("aria-selected", b.dataset.tab === target ? "true" : "false");
        });

        // Update panels
        tabPanels.forEach((p) => {
            p.classList.toggle("active", p.id === `panel-${target}`);
        });

        // Clear all messages on tab switch
        clearMsg(loginError);
        clearMsg(resetError);
        clearMsg(resetSuccess);
    });
});

/* ── PASSWORD VISIBILITY TOGGLE ─────────────────────────────── */
togglePw.addEventListener("click", () => {
    const isHidden = loginPw.type === "password";
    loginPw.type = isHidden ? "text" : "password";
    togglePw.textContent = isHidden ? "hide" : "show";
    togglePw.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

/* ── SIGN IN ─────────────────────────────────────────────────── */
async function handleSignIn() {
    clearMsg(loginError);

    const email = loginEmail.value.trim();
    const password = loginPw.value;

    // Basic client-side validation before hitting Firebase
    if (!email) {
        showError(loginError, "Please enter your email address.");
        loginEmail.focus();
        return;
    }
    if (!password) {
        showError(loginError, "Please enter your password.");
        loginPw.focus();
        return;
    }

    setLoading(btnSignIn, true);

    try {
        await signInCreator(email, password);
        // On success — redirect to dashboard
        // Small delay so the user sees the button state change
        btnSignIn.textContent = "// Access Granted ✓";
        setTimeout(() => {
            window.location.replace("/dashboard/index.html");
        }, 600);

    } catch (err) {
        showError(loginError, err.message);
        shakeCard();
        setLoading(btnSignIn, false);
        loginPw.value = "";   // clear password field on error
        loginPw.focus();
    }
}

// Button click
btnSignIn.addEventListener("click", handleSignIn);

// Allow Enter key to submit from either field
loginEmail.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSignIn(); });
loginPw.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSignIn(); });

/* ── PASSWORD RESET ──────────────────────────────────────────── */
async function handleReset() {
    clearMsg(resetError);
    clearMsg(resetSuccess);

    const email = resetEmail.value.trim();

    if (!email) {
        showError(resetError, "Please enter your email address.");
        resetEmail.focus();
        return;
    }

    setLoading(btnReset, true);

    try {
        const msg = await sendPasswordReset(email);
        showSuccess(resetSuccess, msg);
        resetEmail.value = "";
    } catch (err) {
        showError(resetError, err.message);
    } finally {
        setLoading(btnReset, false);
    }
}

btnReset.addEventListener("click", handleReset);
resetEmail.addEventListener("keydown", (e) => { if (e.key === "Enter") handleReset(); });

/* ── BACK TO LOGIN ───────────────────────────────────────────── */
btnBackLogin.addEventListener("click", () => {
    document.getElementById("tab-login").click();
});