/* ================================================================
   AMARO'S FORGE — auth/firestore.js

   All Firestore operations for the reviews system.
   Imported by:
     - submit-review.html  (submitReview)
     - reviews.html        (getApprovedReviews)
     - dashboard/login-index.html (getPendingReviews, approveReview, deleteReview)

   Firestore collection structure:
     /reviews/{reviewId}
       quote      : string   — the review text
       name       : string   — client's full name
       role       : string   — their role / company
       initials   : string   — auto-derived from name (e.g. "JD")
       status     : string   — "pending" | "approved" | "rejected"
       createdAt  : timestamp
       approvedAt : timestamp (set when approved)
================================================================ */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Re-use the already-initialized Firebase app from firebase-config.js
// We import auth to trigger initialization, then grab the app
import { auth } from "./firebase-config.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const db = getFirestore(getApp());
const REVIEWS = "reviews"; // collection name

/* ----------------------------------------------------------------
   SUBMIT REVIEW (public — called from submit-review.html)
   Writes a new review with status "pending".
   Firestore rules allow anyone to create with status="pending".
---------------------------------------------------------------- */
export async function submitReview({ name, role, quote }) {
    // Derive initials from name (e.g. "Jane Doe" → "JD")
    const initials = name
        .trim()
        .split(/\s+/)
        .map((w) => w[0].toUpperCase())
        .slice(0, 2)
        .join("");

    await addDoc(collection(db, REVIEWS), {
        name: name.trim(),
        role: role.trim(),
        quote: quote.trim(),
        initials,
        status: "pending",
        createdAt: serverTimestamp(),
    });
}

/* ----------------------------------------------------------------
   GET APPROVED REVIEWS (public — called from reviews.html)
   Returns all reviews with status="approved", newest first.
---------------------------------------------------------------- */
export async function getApprovedReviews() {
    const q = query(
        collection(db, REVIEWS),
        where("status", "==", "approved"),
        orderBy("approvedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ----------------------------------------------------------------
   GET PENDING REVIEWS (creator only — called from dashboard)
   Returns all reviews with status="pending", oldest first.
---------------------------------------------------------------- */
export async function getPendingReviews() {
    const q = query(
        collection(db, REVIEWS),
        where("status", "==", "pending"),
        orderBy("createdAt", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ----------------------------------------------------------------
   APPROVE REVIEW (creator only)
   Sets status to "approved" and stamps approvedAt.
---------------------------------------------------------------- */
export async function approveReview(id) {
    await updateDoc(doc(db, REVIEWS, id), {
        status: "approved",
        approvedAt: serverTimestamp(),
    });
}

/* ----------------------------------------------------------------
   DELETE REVIEW (creator only)
   Permanently removes the review document.
---------------------------------------------------------------- */
export async function deleteReview(id) {
    await deleteDoc(doc(db, REVIEWS, id));
}

/* ----------------------------------------------------------------
   GET ALL REVIEWS (creator only — for full management view)
   Returns every review regardless of status, newest first.
---------------------------------------------------------------- */
export async function getAllReviews() {
    const q = query(
        collection(db, REVIEWS),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}