# Smart Digital BD — সংশোধিত ফাইল

## এই ZIP-এ কী আছে
- `index.html` — মূল ওয়েবসাইট, অর্ডার ফর্ম ও অর্ডার ট্র্যাকিং
- `style.css` — ডিজাইন
- `app.js` — Firebase-এ অর্ডার জমা ও ট্র্যাকিং
- `admin.html` এবং `admin.js` — অ্যাডমিন লগইন ও অর্ডার Accept/Reject
- `firestore.rules` — আপনার দেওয়া Admin UID বসানো Firestore Rules

## Firebase Rules বসানোর নিয়ম (মোবাইল থেকে)
1. Firebase Console খুলুন: https://console.firebase.google.com/
2. `smart-digital-bd` প্রজেক্ট খুলুন।
3. **Build → Firestore Database → Rules**-এ যান।
4. Rules editor-এর পুরোনো লেখা সম্পূর্ণ সিলেক্ট করে এই ZIP-এর `firestore.rules` ফাইলের সম্পূর্ণ লেখা পেস্ট করুন।
5. **Publish** চাপুন।

এই Rules-এ Admin UID হিসেবে আপনার দেওয়া `4lm1ZhfL1WRbdmeLbRezks6W4lQ2` বসানো হয়েছে। এটি কাজ করবে তখনই, যখন Firebase Authentication-এর Email/Password provider-এ তৈরি অ্যাডমিন ইউজারের UID হুবহু এই UID হবে।

## অ্যাডমিন লগইন চালু করা
1. Firebase Console → **Build → Authentication → Sign-in method** খুলুন।
2. **Email/Password** চালু করুন।
3. **Users** ট্যাবে নিশ্চিত করুন যে অ্যাডমিন ইউজারের UID `4lm1ZhfL1WRbdmeLbRezks6W4lQ2`।
4. Firebase Console → **Authentication → Users** থেকে অ্যাডমিনের ইমেইল/পাসওয়ার্ড দিয়ে `admin.html`-এ লগইন করুন। এই ফাইলে অ্যাডমিনের পাসওয়ার্ড রাখা নেই।

## GitHub-এ ফাইল রিপ্লেস করা
1. ZIP ডাউনলোড করে Extract করুন।
2. আপনার GitHub repository `Smart-Digital-BD` খুলুন।
3. পুরোনো `index(1).html` থাকলে সেটি মুছে বা আর ব্যবহার না করে নতুন `index.html` আপলোড করুন। Render-এর মূল পেজের নাম অবশ্যই `index.html` হতে হবে।
4. `admin.html`, `admin.js`, `app.js`, `style.css` ফাইলগুলোর পুরোনো সংস্করণ Replace করুন।
5. `firestore.rules` ফাইলটি repository-তে রাখা যেতে পারে, তবে এটি GitHub-এ আপলোড করলেই Firebase Rules প্রকাশ হয় না—Firebase Console-এ আলাদাভাবে Publish করতে হবে।
6. সব পরিবর্তন Commit করুন। Render connected থাকলে নতুন deploy শুরু হওয়ার কথা।

## গুরুত্বপূর্ণ
- Firebase web config ব্রাউজারে দেখা যায়; নিরাপত্তা Firestore Rules ও Authentication-এর ওপর নির্ভর করে।
- কখনো Firebase service-account private key ওয়েবসাইটে বা GitHub-এ রাখবেন না।
- Rules Publish করার পরে একটি টেস্ট অর্ডার দিন, তারপর `admin.html` থেকে Accept/Reject এবং ওয়েবসাইটের Order Tracking পরীক্ষা করুন।
- যদি অর্ডার জমা না হয়, Firebase Console → Firestore Database → Data-তে `orders` ও `orderStatus` collection তৈরি হচ্ছে কি না দেখুন।
