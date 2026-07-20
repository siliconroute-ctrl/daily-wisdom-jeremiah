# Daily Wisdom from Jeremiah — Complete Setup Guide

## Project Overview
- **Frontend**: React web app (Vercel deployment)
- **Backend**: Firebase (authentication, database, cloud functions)
- **Notifications**: Firebase Cloud Messaging + SendGrid email
- **Database**: Firestore
- **Mobile**: Capacitor.js for iOS/Android

---

## Phase 1: Firebase Setup (30 minutes)

### 1. Create Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Go to console" → Create new project
3. Name it: `daily-wisdom-jeremiah`
4. Accept defaults, create project

### 2. Enable Services
In Firebase Console, go to each location in the left sidebar under **Build**:

1. **Authentication** 
   - Build → Authentication → Get Started → Email/Password → Enable

2. **Firestore Database**
   - Build → Firestore Database → Create Database → Select "Production mode"

3. **Cloud Storage** (optional, for images later)
   - Build → Storage → Get Started

4. **Cloud Messaging** (for push notifications)
   - Build → Cloud Messaging → Generate key pair when prompted

### 3. Get Your Config (Step-by-Step)

**This can be tricky — here's exactly where to find it:**

1. **Open Project Settings**
   - In Firebase Console, look at TOP LEFT
   - You'll see your project name: "daily-wisdom-jeremiah"
   - Click the **gear icon ⚙️** right next to it
   
2. **Find Your Web App**
   - You're now in "Project Settings" page
   - Look for tabs: General | Users and permissions | Service accounts
   - Stay on **General** tab
   - Scroll DOWN to find **"Your apps"** section
   - You'll see a list of your apps

3. **If web app doesn't exist yet:**
   - Click **"Add app"** button
   - Click **Web** icon (`<>`)
   - Enter name: `daily-wisdom-app`
   - Click "Register app"

4. **Copy the Config**
   - In "Your apps" section, you'll see your app listed
   - Right next to the app name, click the **`</>`** icon
   - A popup will appear with your config code
   - It looks like:
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

5. **Paste into Your App**
   - Open `daily-wisdom-production.jsx` in a text editor
   - Go to **Line 22**: `const firebaseConfig = { ... }`
   - Delete the placeholder config
   - Paste YOUR config (all 6 fields)
   - Save the file

**⚠️ Common Issue**: If you don't see "Your apps" section, you might need to refresh the page or scroll down further.

### 4. Set Firestore Rules
In Firestore → Rules, replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public read access to verses
    match /verses/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.auth.token.admin == true;
    }
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Subscriptions
    match /subscriptions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Phase 2: Load Verse Data (10 minutes)

### Import Verses to Firestore
1. Firebase Console → Firestore → Collection → Create collection `verses`
2. Add documents manually OR use this Node.js script:

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Create `seed-verses.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const verses = require('./jeremiah-verses-db.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedVerses() {
  const batch = db.batch();
  verses.verses.forEach((verse, index) => {
    const docRef = db.collection('verses').doc(String(verse.id));
    batch.set(docRef, {
      ...verse,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      shares: 0
    });
  });
  
  await batch.commit();
  console.log(`✓ Seeded ${verses.verses.length} verses`);
  process.exit(0);
}

seedVerses().catch(err => {
  console.error(err);
  process.exit(1);
});
```

Run:
```bash
node seed-verses.js
```

---

## Phase 3: Set Up Email Notifications (20 minutes)

### Option A: SendGrid (Recommended)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key from Settings → API Keys
3. Create Cloud Function (Firebase Console → Functions):

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = functions.config().sendgrid.key;
sgMail.setApiKey(SENDGRID_API_KEY);

exports.sendDailyVerse = functions.pubsub
  .schedule('every day 07:00')
  .timeZone('Africa/Johannesburg')
  .onRun(async (context) => {
    
    // Get today's verse
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await admin.firestore()
      .collection('verses')
      .where('date', '==', today)
      .get();
    
    if (snapshot.empty) {
      console.log('No verse for today');
      return;
    }
    
    const verse = snapshot.docs[0].data();
    
    // Get all subscribed users
    const users = await admin.firestore()
      .collection('users')
      .where('subscribed', '==', true)
      .where('notificationMethod', '==', 'email')
      .get();
    
    // Send emails
    const emails = users.docs.map(doc => ({
      to: doc.data().email,
      from: 'wisdom@dailywisdom.app',
      subject: `Daily Wisdom: Jeremiah ${verse.chapter}:${verse.verse}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Daily Wisdom from Jeremiah</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            <em>"${verse.text}"</em>
          </p>
          <p style="color: #999; font-size: 14px;">Jeremiah ${verse.chapter}:${verse.verse}</p>
          
          <h3 style="color: #333; margin-top: 20px;">Reflection</h3>
          <p style="color: #555; line-height: 1.6;">${verse.reflection}</p>
          
          <h3 style="color: #2ecc71; margin-top: 20px;">Wellness tip for today</h3>
          <p style="color: #555; line-height: 1.6;">${verse.wellnessTip}</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            <a href="https://dailywisdom.app">View on website</a> | 
            <a href="https://dailywisdom.app/unsubscribe?uid=${doc.id}">Unsubscribe</a>
          </p>
        </div>
      `
    }));
    
    for (const msg of emails) {
      await sgMail.send(msg);
    }
    
    console.log(`✓ Sent ${emails.length} verses`);
  });
```

Deploy:
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase deploy --only functions
```

### Option B: Firebase Extensions (Easier)
Firebase Console → Extensions → Search "Mailchimp" or "SendGrid" → Install
Follow prompts, much easier than writing functions.

---

## Phase 4: Deploy React App (10 minutes)

### Build for Production
```bash
npm install -D vite @vitejs/plugin-react

# Create vite.config.js:
import react from '@vitejs/plugin-react'
export default {
  plugins: [react()],
  build: { outDir: 'dist' }
}

npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect GitHub:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect GitHub repo
4. Add environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.
5. Auto-deploys on push

---

## Phase 5: Admin Dashboard Features (Optional)

Add to `daily-wisdom-app.jsx` AdminPanel:

```javascript
// Add this to AdminPanel component
const handleAddVerse = async (verseData) => {
  const db = getFirestore();
  const docRef = await addDoc(collection(db, 'verses'), {
    ...verseData,
    createdAt: serverTimestamp(),
    likes: 0,
    shares: 0
  });
  console.log('Verse added:', docRef.id);
};

const handleScheduleVerse = async (verseId, date) => {
  const db = getFirestore();
  await updateDoc(doc(db, 'verses', verseId), {
    date: date,
    scheduled: true
  });
};
```

---

## Phase 6: Mobile App with Capacitor (20 minutes)

### Setup
```bash
npm install @capacitor/core @capacitor/cli

npx cap init
# App name: Daily Wisdom
# Package ID: com.inspirliving.dailywisdom

npx cap add ios
npx cap add android
```

### Add Push Notifications
```bash
npm install @capacitor/push-notifications
```

In your app:
```javascript
import { PushNotifications } from '@capacitor/push-notifications';

const registerNotifications = async () => {
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive === 'granted') {
    await PushNotifications.register();
  }
};

PushNotifications.addListener('pushNotificationReceived', (notification) => {
  // Handle notification
  console.log('Notification received:', notification);
});
```

### Build for iOS
```bash
npx cap build ios
```
Opens Xcode → Select simulator → Run

### Build for Android
```bash
npx cap build android
```
Opens Android Studio → Run on emulator

---

## Phase 7: Google Play Store / App Store (Optional)

### Android
1. Generate signing key: `keytool -genkey -v -keystore my-key.keystore -keyalg RSA`
2. Android Studio → Build → Generate Signed Bundle/APK
3. Upload to Google Play Console

### iOS
1. Apple Developer account ($99/year)
2. Xcode → Product → Archive
3. Distribute via App Store
4. TestFlight for beta testing

---

## Security Checklist

- [ ] Firebase project restricted to your domain
- [ ] Firestore rules locked down (see Phase 1)
- [ ] API keys restricted in Firebase Console
- [ ] SendGrid key stored in environment variables
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced on all URLs
- [ ] Admin users clearly identified

---

## Testing Checklist

- [ ] User signup/login works
- [ ] Daily verse displays correctly
- [ ] Email notifications send at 7 AM
- [ ] Push notifications appear on mobile
- [ ] Archive search filters verses
- [ ] Admin can add/edit verses
- [ ] Copy verse button works
- [ ] Share functionality works
- [ ] Responsive on mobile, tablet, desktop

---

## Troubleshooting

### Firebase Auth not working
- Check API key in config
- Verify Email/Password enabled in Firebase Console
- Check browser console for CORS errors

### Emails not sending
- Verify SendGrid API key is correct
- Check Cloud Function logs: `firebase functions:log`
- Ensure users have `subscribed: true` in Firestore

### Mobile app won't run
- Run `npx cap sync` after code changes
- Check that native code is in `ios/` and `android/` folders
- Emulator must be running: `emulator -avd YourEmulator`

### Deployment fails
- Push only `dist/` folder to Vercel
- Verify environment variables are set
- Check `npm run build` works locally

---

## Next Steps

1. **Analytics**: Add Firebase Analytics to track user behavior
2. **Social Sharing**: Integrate with WhatsApp, Twitter
3. **Favorites**: Let users bookmark favorite verses
4. **Communities**: Build discussion groups per verse
5. **Streaks**: Gamify with "reading streaks"
6. **Localization**: Translate app to Portuguese, Yoruba

---

## Support & Resources

- Firebase Docs: https://firebase.google.com/docs
- Capacitor Docs: https://capacitorjs.com/docs
- Vercel Deployment: https://vercel.com/docs
- SendGrid Email: https://sendgrid.com/docs

---

**Estimated Total Setup Time**: 1-2 hours  
**Monthly Cost**: ~$5-15 (Firebase free tier + SendGrid credits)  
**Go-live Timeline**: 1 week
