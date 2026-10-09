// Firebase Web SDK configuration goes here after creating a Firebase project.
// Follow README.md. Until configured, the form will show a setup message.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
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
    await addDoc(collection(db, "orders"), { ...order, createdAt: serverTimestamp(), status: "new" });
    message.textContent = "ধন্যবাদ! আপনার অর্ডার জমা হয়েছে।";
    form.reset();
  } catch (error) {
    console.error(error);
    message.textContent = "অর্ডার জমা হয়নি। Firebase সেটিংস ও Firestore Rules পরীক্ষা করুন।";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "অর্ডার পাঠান";
  }
});
