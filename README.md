# Smart Digital BD — website starter

এই প্রজেক্টে আছে:
- বাংলা, মোবাইল-ফ্রেন্ডলি ওয়েবসাইট
- সার্ভিস ও ডিজিটাল পণ্যের নমুনা কার্ড
- অর্ডার ফর্ম
- Firebase Firestore-এ অর্ডার সংরক্ষণের জন্য প্রস্তুত কোড
- GitHub + Render Static Site-এ প্রকাশের উপযোগী ফাইল

## 1) Firebase সেটআপ
1. https://console.firebase.google.com/ খুলে Google অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
2. Add project দিয়ে নতুন প্রজেক্ট তৈরি করুন (যেমন `smart-digital-bd`)।
3. Project overview-তে Web app (`</>`) যোগ করুন।
4. Firebase যে `firebaseConfig` দেখাবে, তা কপি করুন।
5. এই প্রজেক্টের `app.js` ফাইলে `const firebaseConfig = { ... }` অংশে নিজের মানগুলো বসান।
6. Firebase Console → Build → Firestore Database → Create database নির্বাচন করে ডাটাবেস তৈরি করুন।

## 2) Firestore Rules — নিরাপত্তা
অর্ডার ফর্মে Firebase থেকে সরাসরি ডাটা লেখা হবে। শুরুর পরীক্ষার জন্যও Rules বুঝে সেট করুন; কখনোই স্থায়ীভাবে সবাইকে সব ডাটা পড়ার অনুমতি দেবেন না।
প্রাথমিক পরীক্ষায় শুধু create allow করা যেতে পারে, কিন্তু এতে স্প্যাম অর্ডার আসতে পারে। বাস্তব ব্যবসায় ব্যবহারের আগে Firebase App Check, validation এবং নিরাপদ backend/rate limiting যোগ করুন। Admin order list এই টেমপ্লেটে নেই।

## 3) GitHub-এ আপলোড
1. https://github.com/ এ একটি account খুলুন / sign in করুন।
2. New repository তৈরি করুন, নাম দিন `smart-digital-bd`।
3. এই ZIP extract করে `index.html`, `style.css`, `app.js`, `README.md` ফাইলগুলো repository-তে upload করুন।
4. `app.js`-এ Firebase config বসানোর পর commit করুন। Firebase web config সাধারণত public client config; তবে Firestore Rules সঠিকভাবে সুরক্ষিত করা অত্যন্ত জরুরি। কখনো service-account key বা private secret ওয়েবসাইটে রাখবেন না।

## 4) Render-এ প্রকাশ
1. https://render.com/ খুলে GitHub দিয়ে sign in করুন।
2. New + → Static Site নির্বাচন করুন।
3. `smart-digital-bd` repository connect করুন।
4. Build Command ফাঁকা রাখুন; Publish Directory দিন `.` (একটি ডট)।
5. Create Static Site চাপুন। Render একটি `onrender.com` ঠিকানা দেবে।
6. ভবিষ্যতে GitHub-এ পরিবর্তন push করলে Render আবার deploy করবে।

## 5) প্রকাশের আগে নিজের তথ্য বসান
- পণ্যের দাম ও বিবরণ যাচাই করুন।
- নিজের যোগাযোগের তথ্য, Privacy Policy এবং Refund/Delivery Policy যোগ করুন।
- এই টেমপ্লেট নিজে থেকে পেমেন্ট গ্রহণ করে না।
- কোনো বাস্তব পেমেন্ট সিস্টেম যোগ করার আগে অনুমোদিত payment provider ও নিরাপত্তা ব্যবস্থা ব্যবহার করুন।

## ফাইল
- `index.html`: ওয়েবসাইটের কাঠামো
- `style.css`: ডিজাইন
- `app.js`: মেনু, অর্ডার ফর্ম এবং Firebase integration
