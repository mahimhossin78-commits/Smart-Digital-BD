// customer.js — Smart Digital BD
// ফিক্স: ইমেইল ভেরিফিকেশন যোগ করা হয়েছে। এটি ছাড়া Firestore Rules অর্ডার
// লেখা আটকে দেয় (403 PERMISSION_DENIED), ফলে গ্রাহক অর্ডার করতে পারত না।
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendEmailVerification,
  reload
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_-mRgfZS9oAuG1w3HzyXJJhylurfi3e4",
  authDomain: "smart-digital-bd.firebaseapp.com",
  projectId: "smart-digital-bd",
  storageBucket: "smart-digital-bd.firebasestorage.app",
  messagingSenderId: "1062207066369",
  appId: "1:1062207066369:web:bf1f5eb2129a471a694b00",
  measurementId: "G-BPCRCCJTZR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let mode = "register";
let verifyTimer = null;

const authBox = document.getElementById("authBox");
const dashboard = document.getElementById("dashboard");
const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");

const verifyBox = document.getElementById("verifyBox");
const verifyText = document.getElementById("verifyText");
const verifyBtn = document.getElementById("verifyBtn");
const refreshBtn = document.getElementById("refreshBtn");

function escapeHtml(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function setMode(next) {
  mode = next;
  document.getElementById("authTitle").textContent =
    mode === "register" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "কাস্টমার লগইন";
  document.getElementById("authSubmit").textContent =
    mode === "register" ? "রেজিস্ট্রেশন" : "লগইন";
  document.getElementById("switchMode").textContent =
    mode === "register" ? "আগে অ্যাকাউন্ট আছে? লগইন" : "নতুন অ্যাকাউন্ট? রেজিস্ট্রেশন";
  document.getElementById("customerName").parentElement.classList.toggle("hidden", mode === "login");
  document.getElementById("customerPassword").autocomplete =
    mode === "login" ? "current-password" : "new-password";
}

document.getElementById("switchMode").addEventListener("click", () =>
  setMode(mode === "register" ? "login" : "register")
);

const AUTH_ERRORS = {
  "auth/email-already-in-use": "এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে—লগইন করুন।",
  "auth/invalid-email": "ইমেইল ঠিকভাবে লিখুন।",
  "auth/missing-password": "পাসওয়ার্ড দিন।",
  "auth/weak-password": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
  "auth/invalid-credential": "ইমেইল বা পাসওয়ার্ড ভুল।",
  "auth/user-not-found": "এই ইমেইলে কোনো অ্যাকাউন্ট নেই—রেজিস্ট্রেশন করুন।",
  "auth/wrong-password": "পাসওয়ার্ড ভুল।",
  "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে; কিছুক্ষণ পরে আবার চেষ্টা করুন।",
  "auth/operation-not-allowed": "Firebase Console-এ Email/Password চালু করুন।",
  "auth/unauthorized-domain": "Firebase → Authentication → Settings → Authorized domains-এ smart-digital-bd.onrender.com যোগ করুন।",
  "auth/network-request-failed": "ইন্টারনেট সংযোগ পরীক্ষা করুন।"
};

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "অপেক্ষা করুন...";

  const email = document.getElementById("customerEmail").value.trim();
  const password = document.getElementById("customerPassword").value;
  const name = document.getElementById("customerName").value.trim();

  try {
    let cred;
    if (mode === "register") {
      cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      authMessage.textContent = "অ্যাকাউন্ট তৈরি হয়েছে। এখন ইমেইল ভেরিফাই করুন।";
    } else {
      cred = await signInWithEmailAndPassword(auth, email, password);
      authMessage.textContent = "লগইন সফল।";
    }

    // ★ মূল ফিক্স: রেজিস্ট্রেশনের পরপরই ভেরিফিকেশন ইমেইল পাঠানো
    if (cred.user && !cred.user.emailVerified) {
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        console.error("sendEmailVerification failed:", err.code, err.message);
      }
    }
  } catch (err) {
    authMessage.textContent = AUTH_ERRORS[err.code] || ("সমস্যা হয়েছে: " + err.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));

// ── ইমেইল ভেরিফিকেশন ব্যানার ────────────────────────────────────────────
function startResendCountdown(seconds = 60) {
  if (verifyTimer) clearInterval(verifyTimer);
  let left = seconds;
  verifyBtn.disabled = true;
  verifyBtn.textContent = `আবার পাঠান (${left}s)`;
  verifyTimer = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      clearInterval(verifyTimer);
      verifyBtn.disabled = false;
      verifyBtn.textContent = "আবার ভেরিফিকেশন ইমেইল পাঠান";
    } else {
      verifyBtn.textContent = `আবার পাঠান (${left}s)`;
    }
  }, 1000);
}

function showVerifyBanner(user) {
  if (!verifyBox) return;
  verifyBox.classList.remove("hidden");
  verifyText.innerHTML =
    `অর্ডার করার আগে ইমেইল ভেরিফাই করতে হবে। আমরা একটি লিংক পাঠিয়েছি: <b>${escapeHtml(user.email)}</b>` +
    ` <br>ইমেইল না পেলে স্প্যাম ফোল্ডার দেখুন, অথবা নিচের বাটনে চাপ দিন। ভেরিফাই করার পর “আমি ভেরিফাই করেছি” চাপুন।`;
  startResendCountdown(60);
}

function hideVerifyBanner() {
  if (!verifyBox) return;
  verifyBox.classList.add("hidden");
  if (verifyTimer) clearInterval(verifyTimer);
}

if (verifyBtn) {
  verifyBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;
    verifyBtn.disabled = true;
    try {
      await sendEmailVerification(user);
      verifyText.textContent = "নতুন ভেরিফিকেশন ইমেইল পাঠানো হয়েছে। ইনবক্স/স্প্যাম চেক করুন।";
      startResendCountdown(60);
    } catch (err) {
      verifyBtn.disabled = false;
      verifyText.textContent =
        "ইমেইল পাঠানো যায়নি (" + (err.code || err.message) + ")। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
    }
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;
    refreshBtn.disabled = true;
    refreshBtn.textContent = "চেক হচ্ছে...";
    try {
      await reload(user);
      // টোকেন রিফ্রেশ করলে Firestore-এ নতুন email_verified ক্লেম পৌঁছাবে
      await user.getIdToken(true);
      if (user.emailVerified) {
        hideVerifyBanner();
        authMessage.textContent = "ইমেইল ভেরিফাই হয়েছে। এখন অর্ডার করতে পারবেন।";
        await loadOrders(user.uid);
      } else {
        verifyText.textContent = "এখনো ভেরিফাই হয়নি। ইমেইলের লিংকে ক্লিক করে এখানে ফিরে আসুন।";
      }
    } catch (err) {
      verifyText.textContent = "চেক করা যায়নি: " + (err.message || err.code);
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = "আমি ভেরিফাই করেছি";
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authBox.classList.remove("hidden");
    dashboard.classList.add("hidden");
    hideVerifyBanner();
    return;
  }

  authBox.classList.add("hidden");
  dashboard.classList.remove("hidden");

  document.getElementById("profileName").textContent = user.displayName || "নাম দেওয়া হয়নি";
  document.getElementById("profileEmail").textContent = user.email || "—";
  document.getElementById("profileUid").textContent = user.uid;

  if (user.emailVerified) {
    hideVerifyBanner();
    await loadOrders(user.uid);
  } else {
    showVerifyBanner(user);
    const out = document.getElementById("customerOrders");
    const msg = document.getElementById("ordersMessage");
    out.innerHTML = "";
    msg.textContent = "ইমেইল ভেরিফাই করলে আপনার অর্ডার ও অর্ডার করার সুবিধা চালু হবে।";
  }
});

async function loadOrders(uid) {
  const out = document.getElementById("customerOrders");
  const msg = document.getElementById("ordersMessage");
  out.innerHTML = "";
  msg.textContent = "অর্ডার লোড হচ্ছে...";

  try {
    // ★ ফিক্স: where("uid") + orderBy("createdAt") Firestore composite index চায়।
    //   index ছাড়াই চলার জন্য orderBy বাদ দিয়ে JS-এ সাজানো হচ্ছে।
    const snap = await getDocs(
      query(collection(db, "orders"), where("uid", "==", uid))
    );

    if (snap.empty) {
      msg.textContent = "এখনও আপনার কোনো অর্ডার নেই।";
      return;
    }

    msg.textContent = `আপনার মোট ${snap.size}টি অর্ডার`;
    const labels = {
      pending: "অপেক্ষমাণ",
      accepted: "Approved — অ্যাকসেপ্ট হয়েছে",
      rejected: "Rejected — রিজেক্ট হয়েছে"
    };

    const sorted = snap.docs.slice().sort(
      (a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0)
    );

    sorted.forEach((d) => {
      const o = d.data();
      const card = document.createElement("article");
      card.className = "customer-order";
      card.innerHTML =
        `<h3>${escapeHtml(o.product || "অর্ডার")}</h3>` +
        `<p><b>অর্ডার আইডি:</b> ${escapeHtml(d.id)}</p>` +
        `<p><b>নাম:</b> ${escapeHtml(o.name)}</p>` +
        `<p><b>ফোন:</b> ${escapeHtml(o.phone)}</p>` +
        `<p><b>বিস্তারিত:</b> ${escapeHtml(o.details || "—")}</p>` +
        `<p><b>স্ট্যাটাস:</b> <span class="status">${escapeHtml(labels[o.status] || o.status || "অজানা")}</span></p>`;
      out.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    msg.textContent = "অর্ডার লোড হয়নি। Firestore Rules ও Firebase index পরীক্ষা করুন।";
  }
}

setMode("register");
