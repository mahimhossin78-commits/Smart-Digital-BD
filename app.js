import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp, getDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { CONTACT } from "./config.js";

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

let currentUser = null;

const form = document.getElementById("orderForm");
const message = document.getElementById("formMessage");
const productGrid = document.getElementById("productGrid");
const productSelect = document.getElementById("productSelect");
const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

function htmlSafe(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

const bnNum = (n) => Number(n || 0).toLocaleString("bn-BD");

// ── পণ্য: শুধু Firestore থেকে (ভুয়া হার্ডকোড পণ্য আর নেই) ────────────────
function renderProducts(items) {
  if (!productGrid) return;

  if (!items.length) {
    productGrid.innerHTML =
      '<p class="muted">এখনো কোনো পণ্য যোগ করা হয়নি। ' +
      '<a href="' + CONTACT.whatsapp + '" target="_blank" rel="noopener">WhatsApp-এ যোগাযোগ করুন</a>।</p>';
    return;
  }

  productGrid.innerHTML = items.map((p, i) =>
    `<article class="product-card">
       <div class="product-art ${["art-purple", "art-blue", "art-orange"][i % 3]}">
         ${p.imageUrl
           ? `<img src="${htmlSafe(p.imageUrl)}" alt="${htmlSafe(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0">`
           : `<span>${htmlSafe(p.category || "PRODUCT")}</span><b>${htmlSafe(p.name)}</b><small>SMART DIGITAL BD</small>`}
       </div>
       <div class="product-info">
         <span class="pill">${htmlSafe(p.category || "পণ্য")}</span>
         <h3>${htmlSafe(p.name)}</h3>
         <p>${htmlSafe(p.description || "বিস্তারিত জানতে অর্ডার করুন।")}</p>
         <div class="product-bottom">
           <strong>৳${bnNum(p.price)}</strong>
           <button class="small-order" data-product="${htmlSafe(p.name)}">অর্ডার</button>
         </div>
       </div>
     </article>`
  ).join("");

  // ★ ড্রপডাউনও একই আসল পণ্য দিয়ে তৈরি — ভুয়া অপশন থাকবে না
  const keep = productSelect.querySelector('option[value=""]');
  productSelect.innerHTML = "";
  productSelect.appendChild(keep);
  items.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = `${p.name} — ৳${bnNum(p.price)}`;
    productSelect.appendChild(opt);
  });

  productGrid.querySelectorAll("[data-product]").forEach((b) =>
    b.addEventListener("click", () => {
      productSelect.value = b.dataset.product;
      document.getElementById("order").scrollIntoView({ behavior: "smooth" });
      updateWhatsappLink();
    })
  );
}

async function loadPublicProducts() {
  try {
    const snap = await getDocs(
      query(collection(db, "products"), where("active", "==", true), orderBy("position", "asc"))
    );
    renderProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.warn("Firestore products could not load.", e);
    if (productGrid) {
      productGrid.innerHTML =
        '<p class="muted">পণ্য লোড করা যায়নি। ' +
        '<a href="' + CONTACT.whatsapp + '" target="_blank" rel="noopener">WhatsApp-এ যোগাযোগ করুন</a>।</p>';
    }
  }
}

// ── WhatsApp লিংকে নির্বাচিত পণ্যের নাম যুক্ত হবে ──────────────────────────
function updateWhatsappLink() {
  const chosen = productSelect ? productSelect.value : "";
  const txt = chosen
    ? `আসসালামু আলাইকুম, আমি "${chosen}" নিতে চাই।`
    : "আসসালামু আলাইকুম, আমি Smart Digital BD থেকে সার্ভিস নিতে চাই।";
  const url = `${CONTACT.waBase}?text=${encodeURIComponent(txt)}`;
  ["waFloat", "heroWhatsapp"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = url;
  });
}

// ── লগইন অবস্থা অনুযায়ী বাটনের লেখা ও আচরণ ────────────────────────────────
function syncAuthUI() {
  if (!submitBtn) return;
  submitBtn.disabled = false;
  if (!currentUser) {
    submitBtn.textContent = "লগইন করে অর্ডার করুন";
  } else if (!currentUser.emailVerified) {
    submitBtn.textContent = "আগে ইমেইল ভেরিফাই করুন";
  } else {
    submitBtn.textContent = "অর্ডার পাঠান";
  }
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  syncAuthUI();
  if (user) {
    // ★ লগইন করা থাকলে নাম/ফোন আগে থেকেই বসিয়ে দেওয়া হয়
    const nameEl = document.getElementById("orderName");
    const phoneEl = document.getElementById("orderPhone");
    if (nameEl && !nameEl.value) nameEl.value = user.displayName || "";
    if (phoneEl && !phoneEl.value && user.phoneNumber) phoneEl.value = user.phoneNumber;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

// ── মোবাইল মেনু ────────────────────────────────────────────────────────────
const menuToggle = document.getElementById("menuToggle");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const nav = document.getElementById("mainNav");
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}
document.querySelectorAll("#mainNav a").forEach((a) =>
  a.addEventListener("click", () => {
    document.getElementById("mainNav").classList.remove("open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  })
);

if (productSelect) productSelect.addEventListener("change", updateWhatsappLink);

// ── অর্ডার জমা ─────────────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ★ আগে শুধু এরর দেখাত। এখন সরাসরি লগইন পেজে পাঠিয়ে দেয়।
  if (!currentUser) {
    message.innerHTML =
      'অর্ডার করতে আগে লগইন করতে হবে। ' +
      '<a href="customer.html"><b>লগইন / রেজিস্ট্রেশন পেজে যাচ্ছেন...</b></a>';
    setTimeout(() => { window.location.href = "customer.html"; }, 1200);
    return;
  }

  // ★ ইমেইল ভেরিফাই না করা থাকলে Firestore 403 দেবে — আগেই বলে দিই
  if (!currentUser.emailVerified) {
    message.innerHTML =
      'অর্ডার করতে আগে ইমেইল ভেরিফাই করতে হবে। ' +
      '<a href="customer.html"><b>এখানে ক্লিক করে ভেরিফাই করুন</b></a>।';
    return;
  }

  const data = new FormData(form);
  const order = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    product: String(data.get("product") || "").trim(),
    details: String(data.get("details") || "").trim()
  };

  if (!order.name || !order.phone || !order.product) {
    message.textContent = "নাম, ফোন নম্বর ও পণ্য নির্বাচন করুন।";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "পাঠানো হচ্ছে...";

  try {
    const orderRef = await addDoc(collection(db, "orders"), {
      ...order,
      uid: currentUser.uid,
      email: currentUser.email || "",
      createdAt: serverTimestamp(),
      status: "pending",
      source: "homepage"          // ★ কোন পেজ থেকে এসেছে
    });

    await setDoc(doc(db, "orderStatus", orderRef.id), {
      uid: currentUser.uid,
      status: "pending",
      product: order.product,
      createdAt: serverTimestamp()
    });

    message.innerHTML =
      `✅ ধন্যবাদ! অর্ডার জমা হয়েছে।<br><b>অর্ডার আইডি:</b> ${htmlSafe(orderRef.id)}` +
      ` — আপনার ড্যাশবোর্ডে দেখতে পাবেন।`;
    form.reset();
  } catch (err) {
    console.error(err);
    message.textContent =
      "অর্ডার জমা হয়নি (" + (err.code || err.message) + ")। একটু পরে আবার চেষ্টা করুন অথবা WhatsApp-এ মেসেজ দিন।";
  } finally {
    submitBtn.disabled = false;
    syncAuthUI();
  }
});

// ── অর্ডার ট্র্যাক ─────────────────────────────────────────────────────────
const trackForm = document.getElementById("trackForm");
if (trackForm) {
  trackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const out = document.getElementById("trackMessage");
    const id = document.getElementById("trackId").value.trim();

    if (!currentUser) {
      out.innerHTML = 'অর্ডার ট্র্যাক করতে আগে <a href="customer.html"><b>লগইন করুন</b></a>।';
      return;
    }

    out.textContent = "খোঁজা হচ্ছে...";
    try {
      const snap = await getDoc(doc(db, "orderStatus", id));
      if (!snap.exists() || snap.data().uid !== currentUser.uid) {
        out.textContent = "এই আইডির অর্ডার আপনার অ্যাকাউন্টে পাওয়া যায়নি।";
        return;
      }
      const labels = { pending: "অপেক্ষমাণ", accepted: "Approved — অ্যাকসেপ্ট হয়েছে", rejected: "Rejected — রিজেক্ট হয়েছে" };
      out.textContent = "অর্ডারের অবস্থা: " + (labels[snap.data().status] || "অজানা");
    } catch (err) {
      out.textContent = "স্ট্যাটাস দেখা যায়নি। একটু পরে আবার চেষ্টা করুন।";
    }
  });
}

updateWhatsappLink();
loadPublicProducts();
