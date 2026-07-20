# Firebase Setup Checklist — 20 Minutes Total

Your project: **512606494351** (daily-wisdom-jeremiah)

## ☑️ In Firebase Console

### Authentication (5 min)
- [ ] Open: **Build** → **Authentication** → **Get Started**
- [ ] Enable: **Email/Password**
- [ ] Enable: **Google** (supports sign-in)
- [ ] Enable: **Phone** (optional, for SMS login)

### Firestore (3 min)
- [ ] Open: **Build** → **Firestore Database** → **Create database**
- [ ] Location: Choose nearest region
- [ ] Mode: **Production mode**
- [ ] Wait for creation (~1-2 min)
- [ ] Go to **Rules** tab → Paste the security rules from the setup guide

### Web App Registration (3 min)
- [ ] Click gear icon ⚙️ → **Project Settings**
- [ ] Scroll to **"Your apps"** → **Add app** → Select **Web**
- [ ] App name: `daily-wisdom-web`
- [ ] Copy your `firebaseConfig` object

---

## ☑️ In Your Code

### Step 1: Get Config from Firebase (already did above)
Copy this from Firebase Console:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_KEY_HERE",
  authDomain: "daily-wisdom-jeremiah.firebaseapp.com",
  projectId: "daily-wisdom-jeremiah",
  storageBucket: "daily-wisdom-jeremiah.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 2: Paste into Code
Open file: `daily-wisdom-production.jsx`

Find line 22: `const firebaseConfig = { ... }`

Replace ENTIRE block with your actual config from above

### Step 3: Install Firebase
```bash
npm install firebase
```

### Step 4: Test Locally
```bash
npm run dev
# Visit http://localhost:5173
# Try signing up with email
```

---

## ☑️ Load Test Data (Optional Now)

You can add sample verses to Firestore:

**Firebase Console:**
1. **Firestore** → **Collections** → **Create collection**
2. Collection ID: `verses`
3. Add first document with these fields:
   - `chapter`: 29
   - `verse`: 11
   - `text`: "For I know the plans I have for you..."
   - `reflection`: "In times of uncertainty..."
   - `wellnessTip`: "Take 5 minutes to journal..."
   - `date`: "2026-03-01"

---

## ☑️ Ready to Deploy

Once tested locally:

```bash
npm run build
npx vercel --prod
```

Add Firebase config as environment variables in Vercel settings.

---

## 🎯 Total Time: ~20 minutes

**What you'll have:**
✅ Email/password login  
✅ Google login  
✅ Phone login (optional)  
✅ Firestore database ready  
✅ App registered  
✅ Code updated  

**Next:** Load verses, deploy, tell your friends! 🚀
