import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_-mRgfZS9oAuG1w3HzyXJJhylurfi3e4",
  authDomain: "smart-digital-bd.firebaseapp.com",
  projectId: "smart-digital-bd",
  storageBucket: "smart-digital-bd.firebasestorage.app",
  messagingSenderId: "1062207066369",
  appId: "1:1062207066369:web:bf1f5eb2129a471a694b00",
  measurementId: "G-BPCRCCJTZR"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const form = document.getElementById("orderPageForm");
const result = document.getElementById("orderResult");
const productSelect = document.getElementById("orderProduct");
const summaryProduct = document.getElementById("summaryProduct");
const summaryPrice = document.getElementById("summaryPrice");
let currentUser = null;
const WA_BASE = "https://wa.me/8801346261152";

// ── অর্ডার সফল হওয়ার পপআপ (স্ক্রিনশট → WhatsApp) ──
const successBackdrop = document.getElementById("successModalBackdrop");
function openSuccessModal(orderId){
  if(!successBackdrop) return;
  const oid=document.getElementById("successOrderId"); if(oid) oid.textContent=orderId||"—";
  const wa=document.getElementById("successWhatsapp");
  if(wa){ const txt="আসসালামু আলাইকুম, আমি একটি অর্ডার করেছি। অর্ডার আইডি: "+(orderId||"")+"। অর্ডারের স্ক্রিনশটটি পাঠাচ্ছি।"; wa.href=WA_BASE+"?text="+encodeURIComponent(txt); }
  successBackdrop.hidden=false; requestAnimationFrame(()=>successBackdrop.classList.add("open")); document.body.classList.add("no-scroll");
}
function closeSuccessModal(){ if(!successBackdrop) return; successBackdrop.classList.remove("open"); document.body.classList.remove("no-scroll"); setTimeout(()=>{successBackdrop.hidden=true;},220); }
const _sc=document.getElementById("successModalClose"), _so=document.getElementById("successOk");
if(_sc)_sc.addEventListener("click",closeSuccessModal);
if(_so)_so.addEventListener("click",closeSuccessModal);
if(successBackdrop)successBackdrop.addEventListener("click",e=>{if(e.target===successBackdrop)closeSuccessModal();});
const priceMap = {
  "ফেসবুক পোস্ট ডিজাইন": "৳১০০ থেকে",
  "CV টেমপ্লেট": "৳১৫০ থেকে",
  "বিজনেস ক্যাপশন প্যাক": "৳২০০ থেকে",
  "অন্য কাজ / কাস্টম অর্ডার": "দাম আলোচনা সাপেক্ষে"
};

function updateSummary() {
  const value = productSelect.value;
  summaryProduct.textContent = value || "পণ্য নির্বাচন করুন";
  summaryPrice.textContent = priceMap[value] || "দাম নিশ্চিত করা হবে";
}
productSelect.addEventListener("change", updateSummary);

const params = new URLSearchParams(location.search);
const requestedProduct = params.get("product");
if (requestedProduct) {
  const exists = [...productSelect.options].some(o => o.value === requestedProduct);
  if (!exists) {
    const option = document.createElement("option");
    option.value = requestedProduct;
    option.textContent = requestedProduct;
    productSelect.appendChild(option);
  }
  productSelect.value = requestedProduct;
}
updateSummary();

async function loadProducts() {
  try {
    // ★ ফিক্স: composite index এড়াতে orderBy বাদ, JS-এ সাজানো হচ্ছে
    const snap = await getDocs(query(collection(db, "products"), where("active", "==", true)));
    const sorted = snap.docs.slice().sort((a, b) => (Number(a.data().position) || 0) - (Number(b.data().position) || 0));
    sorted.forEach(d => {
      const p = d.data();
      if (!p.name) return;
      if (![...productSelect.options].some(o => o.value === p.name)) {
        const option = document.createElement("option");
        option.value = p.name;
        option.textContent = p.name;
        productSelect.appendChild(option);
      }
      if (p.price !== undefined && p.price !== null) priceMap[p.name] = "৳" + Number(p.price).toLocaleString("bn-BD");
    });
    updateSummary();
  } catch (err) {
    console.warn("Could not load Firestore products; showing default products.", err);
  }
}
loadProducts();

onAuthStateChanged(auth, user => { currentUser = user; });

form.addEventListener("submit", async event => {
  event.preventDefault();
  result.className = "result-message";
  result.textContent = "";
  if (!currentUser) {
    result.classList.add("error");
    result.textContent = "অর্ডার জমা দিতে আগে কাস্টমার লগইন করুন। ২ সেকেন্ড পরে লগইন পেজে যাচ্ছেন...";
    setTimeout(() => { window.location.href = "customer.html"; }, 2000);
    return;
  }

  // ★ ইমেইল ভেরিফাই না করা থাকলে Firestore 403 দেবে — আগেই বলে দিই
  if (!currentUser.emailVerified) {
    result.classList.add("error");
    result.innerHTML = 'অর্ডার করতে আগে ইমেইল ভেরিফাই করতে হবে। <a href="customer.html" style="font-weight:700">এখানে ক্লিক করে ভেরিফাই করুন</a>।';
    return;
  }

  const data = new FormData(form);
  const order = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    email: String(data.get("email") || currentUser.email || "").trim(),
    product: String(data.get("product") || "").trim(),
    quantity: Math.max(1, Math.min(100, Number(data.get("quantity") || 1))),
    city: String(data.get("city") || "").trim(),
    address: String(data.get("address") || "").trim(),
    details: String(data.get("details") || "").trim()
  };
  if (!order.name || !order.phone || !order.product) {
    result.classList.add("error");
    result.textContent = "নাম, মোবাইল নম্বর এবং পণ্য নির্বাচন করা আবশ্যক।";
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "অর্ডার জমা হচ্ছে...";
  try {
    const orderRef = await addDoc(collection(db, "orders"), {
      ...order,
      uid: currentUser.uid,
      createdAt: serverTimestamp(),
      status: "pending",
      source: "order-page"
    });
    await setDoc(doc(db, "orderStatus", orderRef.id), {
      uid: currentUser.uid,
      status: "pending",
      product: order.product,
      createdAt: serverTimestamp()
    });
    result.classList.add("success");
    result.textContent = `অর্ডার সফলভাবে জমা হয়েছে! আপনার অর্ডার আইডি: ${orderRef.id}`;
    form.reset();
    productSelect.value = "";
    updateSummary();
    openSuccessModal(orderRef.id); // ★ স্ক্রিনশট→WhatsApp পপআপ
  } catch (error) {
    console.error("Order submission failed:", error);
    result.classList.add("error");
    result.textContent = "অর্ডার জমা হয়নি। Firebase Firestore Rules এবং লগইন অবস্থা পরীক্ষা করুন।";
  } finally {
    button.disabled = false;
    button.textContent = "অর্ডার জমা দিন →";
  }
});
