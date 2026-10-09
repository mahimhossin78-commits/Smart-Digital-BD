// Firebase Web SDK configuration goes here after creating a Firebase project.
// Follow README.md. Until configured, the form will show a setup message.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyC_-mRgfZS9oAuG1w3HzyXJJhylurfi3e4",
  authDomain: "smart-digital-bd.firebaseapp.com",
  projectId: "smart-digital-bd",
  storageBucket: "smart-digital-bd.firebasestorage.app",
  messagingSenderId: "1062207066369",
  appId: "1:1062207066369:web:bf1f5eb2129a471a694b00",
  measurementId: "G-BPCRCCJTZR"
};
const form = document.getElementById("orderForm");
const message = document.getElementById("formMessage");
let db = null;
const configured = firebaseConfig.apiKey !== "PASTE_YOUR_FIREBASE_API_KEY" &&
  firebaseConfig.projectId !== "PASTE_YOUR_PROJECT_ID";

if (configured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase setup error:", error);
  }
}

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("mainNav").classList.toggle("open");
});
document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("mainNav").classList.remove("open"));
});
document.querySelectorAll("[data-product]").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById("productSelect").value = button.dataset.product;
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const order = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    product: String(data.get("product") || "").trim(),
    details: String(data.get("details") || "").trim()
  };

  if (!order.name || !order.phone || !order.product) {
    message.textContent = "অনুগ্রহ করে নাম, ফোন নম্বর ও পণ্য নির্বাচন করুন।";
    return;
  }
  if (!db) {
    message.textContent = "অর্ডার ফর্ম চালু করতে আগে README.md অনুযায়ী Firebase সেটআপ করে app.js-এ কনফিগারেশন বসান।";
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "পাঠানো হচ্ছে...";
  try {
    const orderRef = await addDoc(collection(db, "orders"), { ...order, createdAt: serverTimestamp(), status: "pending" });
    await setDoc(doc(db, "orderStatus", orderRef.id), { status: "pending", product: order.product, createdAt: serverTimestamp() });
    message.textContent = `ধন্যবাদ! অর্ডার জমা হয়েছে। আপনার অর্ডার আইডি: ${orderRef.id} — এটি সংরক্ষণ করুন।`;
    form.reset();
  } catch (error) {
    console.error(error);
    message.textContent = "অর্ডার জমা হয়নি। Firebase সেটিংস ও Firestore Rules পরীক্ষা করুন।";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "অর্ডার পাঠান";
  }
});


import { getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const trackForm = document.getElementById("trackForm");
if (trackForm) trackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const out = document.getElementById("trackMessage");
  const id = document.getElementById("trackId").value.trim();
  if (!db) { out.textContent = "অর্ডার ট্র্যাকিং চালু করতে Firebase কনফিগারেশন বসান।"; return; }
  out.textContent = "খোঁজা হচ্ছে...";
  try {
    const snap = await getDoc(doc(db, "orderStatus", id));
    if (!snap.exists()) { out.textContent = "এই আইডির অর্ডার পাওয়া যায়নি। আইডি ঠিক আছে কি না দেখুন।"; return; }
    const status = snap.data().status;
    const labels = { pending: "অপেক্ষমাণ", accepted: "অ্যাকসেপ্ট হয়েছে", rejected: "রিজেক্ট হয়েছে" };
    out.textContent = `অর্ডারের অবস্থা: ${labels[status] || "অজানা"}`;
  } catch (e) { console.error(e); out.textContent = "স্ট্যাটাস দেখা যায়নি। Firebase Rules পরীক্ষা করুন।"; }
});
