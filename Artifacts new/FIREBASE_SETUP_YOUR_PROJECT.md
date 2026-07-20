# Firebase Setup for Project 512606494351

## Your Project Info
- **Project ID**: daily-wisdom-jeremiah
- **Numeric ID**: 512606494351
- **Status**: Ready to configure

---

## Step 1: Access Your Firebase Project (2 minutes)

1. Go to: **https://console.firebase.google.com**
2. You should see "daily-wisdom-jeremiah" in your projects list
3. Click on it to open

---

## Step 2: Enable Authentication Services (5 minutes)

### Email/Password Authentication

1. **Left sidebar** → Click **Build** → **Authentication**
2. Click **Get Started** button
3. In the "Sign-in method" tab, find **Email/Password**
4. Click on it → Toggle **Enable** → Click **Save**
5. ✅ Email/Password is now active

### Google Sign-in

1. Still in **Authentication** → **Sign-in method** tab
2. Find **Google** in the list
3. Click on it → Toggle **Enable**
4. You'll be asked for a support email (your Firebase account email is fine)
5. Click **Save**
6. ✅ Google Sign-in is now active

### Phone Authentication

1. Still in **Authentication** → **Sign-in method** tab
2. Find **Phone** in the list
3. Click on it → Toggle **Enable**
4. Read the warning about costs (fine for testing)
5. Click **Save**
6. ✅ Phone authentication is now active

---

## Step 3: Set Up Firestore Database (3 minutes)

1. **Left sidebar** → Click **Build** → **Firestore Database**
2. Click **Create database** button
3. You'll see options:
   - **Location**: Choose closest to you (e.g., "us-east1" or "europe-west1")
   - **Security rules**: Select **"Production mode"**
4. Click **Create**

**Wait for it to create** (usually 1-2 minutes)

---

## Step 4: Set Firestore Security Rules (2 minutes)

Once Firestore is created:

1. Click the **"Rules"** tab at the top
2. Replace everything with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public read access to verses
    match /verses/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**
4. ✅ Security rules are now set

---

## Step 5: Register Your Web App (3 minutes)

1. Click the **gear icon ⚙️** at top left
2. Select **"Project Settings"**
3. Click **"Your apps"** section (scroll down if needed)
4. Click **"Add app"** button
5. Select **Web** icon (`<>`)
6. App nickname: `daily-wisdom-web`
7. ✅ Check "Also set up Firebase Hosting" if you want (optional)
8. Click **"Register app"**

---

## Step 6: Copy Your Firebase Config (2 minutes)

After registering the web app, you'll see a screen with:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "daily-wisdom-jeremiah.firebaseapp.com",
  projectId: "daily-wisdom-jeremiah",
  storageBucket: "daily-wisdom-jeremiah.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

**Copy this entire config block** (all 6 lines)

---

## Step 7: Update Your React App Code (2 minutes)

Open `daily-wisdom-production.jsx`

**Find line 22** that looks like:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  // ... placeholder values
};
```

**Replace it completely with your actual config** from Step 6

Save the file

---

## Step 8: Verify Everything Works (5 minutes)

Run your app locally:

```bash
npm install firebase
npm run dev
```

Then try:
1. ✅ Sign up with email/password
2. ✅ Try Google Sign-in button (should show)
3. ✅ Look at the Firestore database (should have your user data)

---

## What You've Set Up

| Feature | Status |
|---------|--------|
| Email/Password Login | ✅ Active |
| Google Sign-in | ✅ Active |
| Phone Authentication | ✅ Active |
| Firestore Database | ✅ Active |
| Security Rules | ✅ Configured |
| Web App Registered | ✅ Active |
| Firebase Config | ✅ Added to code |

---

## Next Steps

1. **Load Verse Data**: Add the 40 Jeremiah verses from `jeremiah-verses-db.json` to Firestore
2. **Deploy**: Push to Vercel
3. **Email Notifications**: Set up SendGrid + Cloud Functions (optional)

---

## Troubleshooting

**"Can't sign in with email"**
- Check that Email/Password is **Enabled** in Authentication
- Verify password is at least 6 characters

**"Google sign-in button not showing"**
- Make sure Google is **Enabled** in Authentication
- Check browser console for errors (F12)

**"Database shows no data"**
- Create test collection `verses`
- Add test document to verify

**"Getting CORS errors"**
- In Project Settings → Authorized domains
- Add your domain (Vercel will give you one)

---

## Your Project is Ready! 🎉

Everything is configured. Your next step: **Run the app and test it.**

Questions? Just ask!
