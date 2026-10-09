import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// app.js-এর একই Firebase config এখানে বসান।
const firebaseConfig = {
  apiKey: "AIzaSyC_-mRgfZS9oAu01w3HzyXJJhylurf13e4",
  authDomain: "smart-digital-bd.firebaseapp.com",
  projectId: "smart-digital-bd",
  storageBucket: "smart-digital-bd.firebasestorage.app",
  messagingSenderId: "1062207066369",
  appId: "1:1062207066369:web:bf1f5eb2129a471a694b00",
  measurementId: "G-BPCRCCJTZR"
};
const configured = firebaseConfig.apiKey !== "PASTE_YOUR_FIREBASE_API_KEY" && firebaseConfig.projectId !== "PASTE_YOUR_PROJECT_ID";
const loginBox=document.getElementById('loginBox'), dashboard=document.getElementById('dashboard');
const loginMessage=document.getElementById('loginMessage'), adminMessage=document.getElementById('adminMessage'), list=document.getElementById('ordersList');
let auth, db;
if(configured){const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);onAuthStateChanged(auth, async user=>{if(user){loginBox.classList.add('hidden');dashboard.classList.remove('hidden');await loadOrders();}else{loginBox.classList.remove('hidden');dashboard.classList.add('hidden');}});}else{loginMessage.textContent='প্রথমে admin.js ও app.js-এ একই Firebase config বসান।';}
document.getElementById('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!auth)return;loginMessage.textContent='লগইন হচ্ছে...';try{await signInWithEmailAndPassword(auth,document.getElementById('email').value.trim(),document.getElementById('password').value);}catch(err){console.error(err);loginMessage.textContent='লগইন হয়নি। ইমেইল/পাসওয়ার্ড ও Firebase Authentication পরীক্ষা করুন।';}});
document.getElementById('logoutBtn').addEventListener('click',()=>signOut(auth));
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const labels={pending:'অপেক্ষমাণ',accepted:'অ্যাকসেপ্ট হয়েছে',rejected:'রিজেক্ট হয়েছে'};
async function loadOrders(){list.innerHTML='';adminMessage.textContent='অর্ডার লোড হচ্ছে...';try{const snap=await getDocs(query(collection(db,'orders'),orderBy('createdAt','desc')));if(snap.empty){adminMessage.textContent='এখনও কোনো অর্ডার নেই।';return;}adminMessage.textContent=`মোট ${snap.size}টি অর্ডার`;
snap.forEach(d=>{const o=d.data();const card=document.createElement('article');card.className='order-card';card.innerHTML=`<h3>${esc(o.product)}</h3><p><b>অর্ডার আইডি:</b> ${esc(d.id)}</p><p><b>নাম:</b> ${esc(o.name)}</p><p><b>ফোন:</b> ${esc(o.phone)}</p><p><b>বিস্তারিত:</b> ${esc(o.details||'—')}</p><p><b>অবস্থা:</b> ${esc(labels[o.status]||o.status||'অজানা')}</p><div class="order-actions"><button class="accept" data-status="accepted">অ্যাকসেপ্ট</button><button class="reject" data-status="rejected">রিজেক্ট</button></div>`;
card.querySelectorAll('button[data-status]').forEach(btn=>btn.addEventListener('click',()=>setStatus(d.id,btn.dataset.status)));list.appendChild(card);});
}catch(e){console.error(e);adminMessage.textContent='অর্ডার লোড হয়নি। Firebase Auth, Admin UID ও Firestore Rules পরীক্ষা করুন।';}}
async function setStatus(id,status){if(!confirm(`অর্ডারটি ${labels[status]} করবেন?`))return;try{await updateDoc(doc(db,'orders',id),{status,updatedAt:serverTimestamp()});await setDoc(doc(db,'orderStatus',id),{status,updatedAt:serverTimestamp()},{merge:true});adminMessage.textContent='অর্ডারের অবস্থা আপডেট হয়েছে।';await loadOrders();}catch(e){console.error(e);alert('স্ট্যাটাস বদলানো যায়নি। Rules-এ আপনার Admin UID সঠিক আছে কি না দেখুন।');}}
