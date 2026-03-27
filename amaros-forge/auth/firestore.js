/* ================================================================
   AMARO'S FORGE — auth/firestore.js

   All Firestore operations for the reviews system.
   Imported by:
     - submit-review.html              (submitReview)
     - reviews.html                    (getApprovedReviews)
     - dashboard/login-index.html      (getPendingReviews, approveReview,
                                        deleteReview, getAllReviews)

   NOTE ON QUERIES:
   Firestore requires a manually-created composite index any time you
   combine where() + orderBy() on DIFFERENT fields. To avoid that
   setup step, all filtering and sorting is done client-side here.
   For the review volumes this site will ever have, this is instant.

   Firestore document structure (/reviews/{id}):
     name       : string
     role       : string
     quote      : string
     initials   : string   (auto-derived, e.g. "JD")
     status     : "pending" | "approved"
     createdAt  : Timestamp
     approvedAt : Timestamp (set on approval)
================================================================ */

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Piggyback on the app already initialized by firebase-config.js
import { auth } from "./firebase-config.js"; // ensures app is init'd

const db = getFirestore(getApp());
const REVIEWS = "reviews";

/* ----------------------------------------------------------------
   SUBMIT REVIEW
   Public — anyone with the link can submit.
   Firestore rules enforce status === "pending" on create.
---------------------------------------------------------------- */
export async function submitReview({ name, role, quote }) {
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
   GET APPROVED REVIEWS
   Public — shown on reviews.html.
   Fetches all reviews ordered by createdAt (single-field index,
   auto-created by Firestore), then filters + sorts client-side.
   No composite index required.
---------------------------------------------------------------- */
export async function getApprovedReviews() {
    const q = query(collection(db, REVIEWS), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return all
        .filter((r) => r.status === "approved")
        .sort((a, b) => {
            const aTime = a.approvedAt?.toMillis?.() ?? 0;
            const bTime = b.approvedAt?.toMillis?.() ?? 0;
            return bTime - aTime;
        });
}

/* ----------------------------------------------------------------
   GET PENDING REVIEWS
   Creator only — shown in the dashboard pending queue.
---------------------------------------------------------------- */
export async function getPendingReviews() {
    const q = query(collection(db, REVIEWS), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return all.filter((r) => r.status === "pending");
}

/* ----------------------------------------------------------------
   GET ALL REVIEWS
   Creator only — shown in the dashboard "All Reviews" tab.
---------------------------------------------------------------- */
export async function getAllReviews() {
    const q = query(collection(db, REVIEWS), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ----------------------------------------------------------------
   APPROVE REVIEW
   Creator only — flips status to "approved" and stamps approvedAt.
---------------------------------------------------------------- */
export async function approveReview(id) {
    await updateDoc(doc(db, REVIEWS, id), {
        status: "approved",
        approvedAt: serverTimestamp(),
    });
}

/* ----------------------------------------------------------------
   DELETE REVIEW
   Creator only — permanently removes the document.
---------------------------------------------------------------- */
export async function deleteReview(id) {
    await deleteDoc(doc(db, REVIEWS, id));
}