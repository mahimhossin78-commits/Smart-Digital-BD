# Smart Digital BD — Product & Service Admin

## GitHub-এ আপলোড
এই ZIP-এর `sdbuild` ফোল্ডারের সব ফাইল আপনার GitHub রিপোজিটরির রুটে আপলোড/replace করুন। বিশেষ করে `admin.html`, `admin.js`, `app.js`, `index.html`, `firestore.rules`। আগের `customer.html`, `customer.js`, `style.css` একই থাকছে।

## Firebase Firestore Rules
Firebase Console → Firestore Database → Rules-এ `firestore.rules`-এর কোড পেস্ট করে Publish করুন। এতে public visitor শুধু products পড়তে পারবে, লিখতে পারবে শুধু admin UID `4lm1ZhfL1WRbdmeLbRezks6W4lQ2`।

## Firebase Storage চালু করা জরুরি
Firebase Console → Build → Storage → Get started করুন (যদি আগে চালু না থাকে)। তারপর Storage → Rules-এ `storage.rules`-এর কোড পেস্ট করে Publish করুন। Admin panel থেকে ছবি এবং ডেলিভারি ফাইল আপলোডের জন্য Storage প্রয়োজন। Firebase billing/plan ও project restrictions অনুযায়ী Storage চালু করতে billing setup চাইতে পারে।

## অ্যাডমিন থেকে পণ্য যোগ
`https://smart-digital-bd.onrender.com/admin.html` → admin login → Product & Service Manager। নাম, ক্যাটাগরি, মূল্য, অবস্থান (১ প্রথমে), বিবরণ, ছবি ও ঐচ্ছিক ডেলিভারি ফাইল দিন → পণ্য যোগ করুন।

## Demo products
হোমপেজে আগে থেকে থাকা ৩টি ডেমো কার্ড থাকবে যদি Firestore-এ কোনো product যোগ না থাকে। নিজের বাস্তব পণ্য যোগ করে যাচাই করার পর ডেমো কার্ডগুলি সরিয়ে ফেলুন বা Firestore-এ পণ্য যোগ করলে live products স্বয়ংক্রিয়ভাবে demo cards-এর জায়গায় দেখাবে। Demo prices are examples; update before accepting real orders.

## নিরাপত্তা ও সীমা
Admin UID অবশ্যই আপনার Firebase Authentication-এর admin UID-এর সঙ্গে মিলতে হবে। Upload limit: ছবি ৮ MB; ডেলিভারি ফাইল ১৪ MB। Storage Rules-এর ১৫ MB সীমা এর সঙ্গে সামঞ্জস্যপূর্ণ। Uploaded delivery-file links are public-readable in these simple rules, so upload only files you intend to share publicly.
