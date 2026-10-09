SMART DIGITAL BD — আলাদা অর্ডার পেজ (ম্যানুয়াল আপলোড প্যাক)
=============================================================

এই ZIP-এ আছে:
1. order.html — প্রিমিয়াম অর্ডার ফর্ম পেজ
2. order.js — Firebase Auth / Firestore-এ অর্ডার জমা দেওয়ার কোড
3. README-BN.txt — আপলোডের নির্দেশনা

গুরুত্বপূর্ণ:
- এই ZIP-এর ফাইলগুলো শুধু নতুন অর্ডার পেজ যোগ করে। এটি index.html বা app.js-কে নিজে থেকে বদলায় না।
- পেমেন্ট গেটওয়ে যুক্ত করা নেই।
- অর্ডার জমা দিতে customer.html-এর মাধ্যমে লগইন থাকা দরকার।
- Firebase Firestore Rules যদি orders এবং orderStatus-এ লেখার অনুমতি না দেয়, তাহলে অর্ডার জমা ব্যর্থ হবে।

মোবাইল দিয়ে GitHub-এ আপলোড:
1. ZIP ডাউনলোড করে Extract/Unzip করুন।
2. GitHub-এ যান: https://github.com/mahimhossin78-commits/Smart-Digital-BD
3. Code ট্যাব → Add file → Upload files।
4. Extract করা order.html ও order.js ফাইল দুটো নির্বাচন করুন (README ঐচ্ছিক)।
5. Commit changes চাপুন।
6. Render স্বয়ংক্রিয় deploy করলে কিছুক্ষণ অপেক্ষা করুন।
7. খুলুন: https://smart-digital-bd.onrender.com/order.html

পণ্যের “অর্ডার” বাটনকে নতুন পেজে পাঠানোর জন্য:
- index.html এবং app.js-এ আগের বাটনগুলো এখনো পুরোনো অর্ডার সেকশনে যেতে পারে।
- পরের ধাপে চাইলে সেগুলোও বদলাতে হবে যেন order.html?product=পণ্যের-নাম খুলে।
- নতুন পেজ সরাসরি পরীক্ষা করতে /order.html খুলে ফর্ম পূরণ করুন।

নিরাপত্তা:
- Firebase client config ওয়েবসাইটে থাকা স্বাভাবিক, কিন্তু Firestore Rules অবশ্যই UID অনুযায়ী নিরাপদ হতে হবে।
- কোনো Firebase Admin private key বা service account key এই ZIP-এ নেই।
