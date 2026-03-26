/* ================================================================
   AMARO'S FORGE — auth/auth.js

   Core authentication module. Imported by:
     - login.js          (sign in + password reset)
     - dashboard/index.html (session guard + sign out)

   Functions exported:
     signInCreator(email, password)  → Promise
     signOutCreator()                → Promise
     sendPasswordReset(email)        → Promise
     guardDashboard()                → void (redirects if not authed)
     onAuthReady(callback)           → unsubscribe fn
================================================================ */

import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { auth, AUTHORIZED_EMAIL } from "./firebase-config.js";

/* ----------------------------------------------------------------
   SIGN IN
   — Authenticates with Firebase
   — Then enforces the single-email whitelist client-side
   — Throws a friendly error string (not a raw Firebase error)
---------------------------------------------------------------- */
export async function signInCreator(email, password) {
    // Step 1: Email whitelist check before even hitting Firebase
    if (email.trim().toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) {
        throw new Error("ACCESS DENIED — unauthorized email address.");
    }

    try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
    } catch (err) {
        // Map Firebase error codes to human-readable messages
        switch (err.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
                throw new Error("Incorrect email or password.");
            case "auth/too-many-requests":
                throw new Error("Too many failed attempts. Try again later or reset your password.");
            case "auth/user-disabled":
                throw new Error("This account has been disabled.");
            case "auth/network-request-failed":
                throw new Error("Network error. Check your connection and try again.");
            default:
                throw new Error("Login failed. Please try again.");
        }
    }
}

/* ----------------------------------------------------------------
   SIGN OUT
---------------------------------------------------------------- */
export async function signOutCreator() {
    try {
        await signOut(auth);
    } catch (err) {
        console.error("Sign out error:", err);
    }
}

/* ----------------------------------------------------------------
   PASSWORD RESET
   — Sends a reset email via Firebase
   — Always shows a success message (don't confirm if email exists)
---------------------------------------------------------------- */
export async function sendPasswordReset(email) {
    if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address.");
    }
    try {
        await sendPasswordResetEmail(auth, email);
        // Intentionally vague — don't reveal if the email exists
        return "If that email is registered, a reset link is on its way.";
    } catch (err) {
        switch (err.code) {
            case "auth/invalid-email":
                throw new Error("That doesn't look like a valid email address.");
            case "auth/network-request-failed":
                throw new Error("Network error. Check your connection and try again.");
            default:
                throw new Error("Couldn't send reset email. Please try again.");
        }
    }
}

/* ----------------------------------------------------------------
   DASHBOARD GUARD
   — Call this at the top of any protected page.
   — If the user is not logged in, OR is the wrong email,
     they get bounced back to login.html immediately.
   — Shows the page content only once auth is confirmed.
---------------------------------------------------------------- */
export function guardDashboard() {
    // Hide page body until auth is confirmed — prevents flash of content
    document.body.style.visibility = "hidden";

    const unsub = onAuthStateChanged(auth, (user) => {
        unsub(); // Only need to check once on page load

        if (!user || user.email.toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) {
            // Not authenticated or wrong user — redirect to login
            window.location.replace("/login.html");
            return;
        }

        // Auth confirmed — reveal the page
        document.body.style.visibility = "visible";

        // Dispatch a custom event so the page can react (e.g. show username)
        document.dispatchEvent(new CustomEvent("af:authed", { detail: { user } }));
    });
}

/* ----------------------------------------------------------------
   AUTH STATE LISTENER
   — Utility for pages that want to react to auth changes
     without hard redirecting.
   — Returns the unsubscribe function.
---------------------------------------------------------------- */
export function onAuthReady(callback) {
    return onAuthStateChanged(auth, callback);
}