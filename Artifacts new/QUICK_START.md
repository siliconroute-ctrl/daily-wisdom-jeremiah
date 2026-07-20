# Daily Wisdom from Jeremiah — Quick Start (1 Hour)

## In 60 Minutes: From Zero to Live App

### Minute 0-10: Firebase Setup
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Go to console" → Create project
3. Name: `daily-wisdom-jeremiah`
4. Accept defaults, create

**In Firebase Console (after project creation):**

1. **Authentication**: Left sidebar → Build → Authentication → Sign-in method → Enable "Email/Password"
2. **Firestore**: Left sidebar → Build → Firestore Database → Create Database (start in production mode)
3. **Cloud Messaging**: Left sidebar → Build → Cloud Messaging (you'll need this later for push notifications)
4. **Get Your Config** (This is the tricky part - here's the exact path):

**Step A: Open Project Settings**
   - Look at Firebase Console homepage
   - Top left area: You'll see your project name (e.g., "daily-wisdom-jeremiah")
   - Next to it: Click the **gear icon ⚙️** (Project Settings)
   
**Step B: Find "Your apps"**
   - You're now in Project Settings page
   - Look at the tabs across the top: General | Users and permissions | Service accounts
   - On the **General** tab, scroll down
   - You'll see a section called **"Your apps"** with a list
   - If empty, click **"Add app"** button and select **"Web"** (`<>` icon)
   - If it exists, you'll see your app listed

**Step C: Get the config code**
   - In the app entry, you should see: `const firebaseConfig = { ... }`
   - This is already there - just copy-paste it
   - If you don't see it, click the **`</>`** icon next to the app name
   - A popup will show the full config

**The config should look like this:**
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "daily-wisdom-jeremiah.firebaseapp.com",
  projectId: "daily-wisdom-jeremiah",
  storageBucket: "daily-wisdom-jeremiah.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**Step D: Paste into your code**
   - Open `daily-wisdom-production.jsx`
   - Find line 22: `const firebaseConfig = { ... }`
   - Replace the entire config (all 6 fields) with YOUR config from Firebase
   - Save the file

### Minute 10-15: Load Verse Data
**Option A: Manual (fastest)**
1. Firestore → Create collection `verses`
2. Add document, copy/paste one verse from `jeremiah-verses-db.json`

**Option B: Bulk import (better)**
```bash
npm install firebase-tools -g
firebase login
firebase init
```
Create `seed.js`:
```javascript
const admin = require('firebase-admin');
const db = admin.initializeApp({
  credential: admin.credential.cert(require('./key.json'))
}).firestore();

const verses = require('./jeremiah-verses-db.json').verses;
verses.forEach(v => db.collection('verses').doc(String(v.id)).set(v));
```
Run: `node seed.js`

### Minute 15-25: Prepare for Deployment

1. **Create React project**
```bash
npm create vite@latest daily-wisdom -- --template react
cd daily-wisdom
npm install
npm install firebase
```

2. **Replace `src/App.jsx`** with content from `daily-wisdom-production.jsx`

3. **Update Firebase config**
```javascript
const firebaseConfig = { /* YOUR CONFIG */ };
```

4. **Set Firestore Rules**
In Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /verses/{doc=**} { allow read: if true; }
    match /users/{userId} { 
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Minute 25-35: Test Locally
```bash
npm run dev
```
Visit `http://localhost:5173`
- Sign up with test@example.com / password123
- See today's verse
- Test archive search

### Minute 35-45: Deploy to Vercel
```bash
npm install -D vercel
npx vercel --prod
```

During deploy, add environment variables:
```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Minute 45-60: Setup Email Notifications
**Option A: Firebase Extensions (easiest)**
1. Firebase Console → Extensions
2. Search & install "Email" or "SendGrid"
3. Follow prompts, done!

**Option B: Manual (with SendGrid)**
1. Sign up: [sendgrid.com](https://sendgrid.com)
2. Get API key from Settings
3. Create Cloud Function:
```bash
firebase init functions
```

In `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendDailyVerse = functions.pubsub
  .schedule('every day 07:00')
  .timeZone('Africa/Johannesburg')
  .onRun(async () => {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const today = new Date().toISOString().split('T')[0];
    const verse = await db.collection('verses')
      .where('date', '==', today).limit(1).get();
    
    const users = await db.collection('users')
      .where('preferences.notificationsEnabled', '==', true).get();
    
    const v = verse.docs[0].data();
    for (const user of users.docs) {
      await sgMail.send({
        to: user.data().email,
        from: 'wisdom@yourdomain.com',
        subject: `Daily Wisdom: Jeremiah ${v.chapter}:${v.verse}`,
        text: v.text
      });
    }
  });
```

Deploy:
```bash
firebase functions:config:set sendgrid.key="YOUR_KEY"
firebase deploy --only functions
```

---

## Done! 🎉

Your app is now live at:
- **Web**: https://your-vercel-url.vercel.app
- **Emails**: Sent daily at 7 AM to all users

### Next Steps (Optional)
- [ ] Custom domain (Vercel settings)
- [ ] Mobile app (Capacitor.js)
- [ ] Analytics (Firebase Analytics)
- [ ] Admin dashboard improvements
- [ ] Social sharing features

### Troubleshooting

**"Firebase config not working"**
- Verify config in app matches Firebase Console
- Check Authentication is enabled

**"No verses showing"**
- Verify Firestore collection is named `verses`
- Check data is actually in database

**"Emails not sending"**
- Check Cloud Function logs: `firebase functions:log`
- Verify SendGrid API key is correct
- Ensure users have `notificationsEnabled: true`

### Costs
- Firebase: **Free tier** (handles ~1000 users)
- Vercel: **Free tier** (handles ~1000 visits/day)
- SendGrid: **Free tier** (100 emails/day)

**Total monthly cost with 1000 users**: ~$0-5

---

**Built in 1 hour. Scale forever.**
