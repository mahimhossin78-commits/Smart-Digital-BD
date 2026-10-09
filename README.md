# Smart Digital BD — Customer Login Update

## এই ZIP-এ যা আছে
- `index.html`, `app.js`: অর্ডার করতে কাস্টমার লগইন বাধ্যতামূলক; প্রতিটি অর্ডারে Firebase Auth UID সংরক্ষণ হয়। অর্ডার ট্র্যাকিংও শুধু নিজের অর্ডারের জন্য।
- `customer.html`, `customer.js`: ইমেইল/পাসওয়ার্ড দিয়ে রেজিস্ট্রেশন ও লগইন, কাস্টমার আইডি, নিজের অর্ডার ও Approved/Rejected স্ট্যাটাস।
- `admin.html`, `admin.js`: আলাদা অ্যাডমিন প্যানেল; নির্দিষ্ট Admin UID-কে যাচাই করে।
- `firestore.rules`: Admin UID `4lm1ZhfL1WRbdmeLbRezks6W4lQ2` ব্যবহার করা Firestore Rules।

## আগে Firebase সেটিংস করুন
1. https://console.firebase.google.com/project/smart-digital-bd/authentication/providers খুলুন।
2. **Email/Password** provider চালু করুন (Email link নয়, Email/Password)।
3. https://console.firebase.google.com/project/smart-digital-bd/authentication/settings খুলে Authorized domains-এ `smart-digital-bd.onrender.com` আছে কি না দেখুন; না থাকলে Add domain করুন।
4. https://console.firebase.google.com/project/smart-digital-bd/firestore/databases/-default-/rules খুলুন।
5. এই ZIP-এর `firestore.rules` ফাইলের সব লেখা Rules editor-এ পেস্ট করে **Publish** করুন।
6. Authentication → Users-এ নিশ্চিত করুন অ্যাডমিন ইউজারের UID `4lm1ZhfL1WRbdmeLbRezks6W4lQ2`।

## GitHub-এ আপডেট (মোবাইল)
1. ZIP ডাউনলোড করে Extract করুন।
2. GitHub repository `Smart-Digital-BD`-এ নিচের ফাইলগুলো একে একে খুলে Edit (পেন্সিল) → সব পুরোনো লেখা Replace → নতুন ফাইলের লেখা Paste → Commit changes করুন:
   - `index.html`
   - `app.js`
   - `admin.js`
   - `README.md`
3. `customer.html`, `customer.js`, `firestore.rules` নামে নতুন ফাইল Create করুন এবং ZIP-এর একই নামের ফাইলের সম্পূর্ণ লেখা পেস্ট করে Commit করুন। `admin.html` ও `style.css` বদলানোর দরকার নেই।
4. Render-এ GitHub auto-deploy চালু থাকলে deploy শেষ হওয়ার অপেক্ষা করুন। তারপর `https://smart-digital-bd.onrender.com/customer.html` খুলে টেস্ট করুন।

## পরীক্ষা
- কাস্টমার নতুন ইমেইল দিয়ে রেজিস্ট্রেশন করুন, তারপর অর্ডার দিন।
- অ্যাডমিন `https://smart-digital-bd.onrender.com/admin.html`-এ লগইন করে Accept/Reject করুন।
- কাস্টমার ড্যাশবোর্ডে ফিরে স্ট্যাটাস দেখুন।

## গুরুত্বপূর্ণ
- আগের অর্ডারগুলোর `uid` নেই, তাই সেগুলো কাস্টমার ড্যাশবোর্ডে দেখা যাবে না। নতুন লগইন করা কাস্টমার অর্ডার থেকে UID যুক্ত হবে।
- Admin UID কোড/Rules-এ নির্দিষ্ট করা হয়েছে। Firebase Authentication-এর অ্যাডমিন ইউজারের UID আলাদা হলে Rules ও `admin.js`-এ সঠিক UID বসাতে হবে।
- Rules Publish না করলে নতুন customer order submission কাজ নাও করতে পারে।
