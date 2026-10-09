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


## 6) Admin Panel + Order Status (নতুন)
- Admin page: `admin.html`
- Customer status tracker: মূল ওয়েবসাইটের “অর্ডার ট্র্যাকিং” অংশ। অর্ডার জমার পর দেখানো অর্ডার আইডি কাস্টমারকে রাখতে হবে।
- Firebase Console → Authentication → Sign-in method থেকে **Email/Password** চালু করুন। Users থেকে নিজের admin email/password user তৈরি করুন।
- `admin.js` ও `app.js`—দুই ফাইলে একই Firebase Web config বসান।
- Firebase Authentication-এর Users তালিকা থেকে নিজের admin user-এর **UID** কপি করুন। Firestore Rules-এ নিচের `PUT_YOUR_ADMIN_UID_HERE`-এর জায়গায় সেই UID বসাতে হবে।
- **গুরুত্বপূর্ণ:** নিচের Rules-ই ব্যবহার করুন; আগের Rules সম্পূর্ণ বদলে দিন। Admin UID বসানো ছাড়া Publish করবেন না।

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.uid == 'PUT_YOUR_ADMIN_UID_HERE';
    }
    match /orders/{orderId} {
      allow create: if request.resource.data.keys().hasAll(['name','phone','product','details','createdAt','status'])
        && request.resource.data.keys().hasOnly(['name','phone','product','details','createdAt','status'])
        && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 80
        && request.resource.data.phone is string && request.resource.data.phone.size() > 0 && request.resource.data.phone.size() <= 30
        && request.resource.data.product is string && request.resource.data.product.size() > 0
        && request.resource.data.details is string && request.resource.data.details.size() <= 1000
        && request.resource.data.status == 'pending' && request.resource.data.createdAt is timestamp;
      allow read, update, delete: if isAdmin();
    }
    match /orderStatus/{orderId} {
      allow get: if true;
      allow list: if false;
      allow create: if (request.resource.data.keys().hasAll(['status','product','createdAt']) && request.resource.data.keys().hasOnly(['status','product','createdAt']) && request.resource.data.status == 'pending' && request.resource.data.product is string && request.resource.data.createdAt is timestamp) || isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

**নিরাপত্তার কথা:** `orderStatus` নথিতে শুধু স্ট্যাটাস/পণ্যের নাম থাকে, গ্রাহকের নাম/ফোন/বিস্তারিত থাকে না। অর্ডার আইডি কাউকে অনুমান করে পাওয়া কঠিন হলেও কাস্টমারকে নিজের আইডি গোপন রাখতে বলুন। পাবলিক অর্ডার ফর্মে স্প্যাম ঠেকাতে পরে App Check বা backend যোগ করা উচিত।


## Firebase config pre-filled
The Firebase Web App configuration provided by the owner is already inserted in `app.js` and `admin.js`. Before using the admin panel, enable Email/Password in Firebase Authentication and create the admin user. Then replace `PUT_YOUR_ADMIN_UID_HERE` in the Firestore Rules below with that user's UID. Do not publish the rules with the placeholder still present.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.uid == 'PUT_YOUR_ADMIN_UID_HERE';
    }
    match /orders/{orderId} {
      allow create: if request.resource.data.keys().hasAll(['name','phone','product','details','createdAt','status'])
        && request.resource.data.keys().hasOnly(['name','phone','product','details','createdAt','status'])
        && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 80
        && request.resource.data.phone is string && request.resource.data.phone.size() > 0 && request.resource.data.phone.size() <= 30
        && request.resource.data.product is string && request.resource.data.product.size() > 0
        && request.resource.data.details is string && request.resource.data.details.size() <= 1000
        && request.resource.data.status == 'pending' && request.resource.data.createdAt is timestamp;
      allow read, update, delete: if isAdmin();
    }
    match /orderStatus/{orderId} {
      allow get: if true;
      allow list: if false;
      allow create: if request.resource.data.keys().hasAll(['status','product','createdAt'])
        && request.resource.data.keys().hasOnly(['status','product','createdAt'])
        && request.resource.data.status == 'pending'
        && request.resource.data.product is string
        && request.resource.data.createdAt is timestamp;
      allow update, delete: if isAdmin();
    }
  }
}
```

Order status documents contain only status, product, and timestamp—not customer name, phone, or details. Public order submission can still be abused for spam; add App Check or a trusted backend before production.
