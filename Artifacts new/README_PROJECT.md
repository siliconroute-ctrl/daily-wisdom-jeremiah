# Daily Wisdom from Jeremiah

A beautiful web app delivering daily reflections from the Book of Jeremiah to your community.

**Status**: ✅ Ready to deploy  
**Tech Stack**: React + Firebase + Vercel  
**Users**: Free tier supports 1000+ active users  

---

## 🚀 Quick Deploy (5 minutes)

See `DEPLOY_NOW.md` for step-by-step deployment instructions.

TL;DR:
```bash
# 1. Install dependencies
npm install

# 2. Test locally
npm run dev

# 3. Push to GitHub
git push

# 4. Deploy to Vercel
# Just go to https://vercel.com/dashboard and import your GitHub repo
```

---

## 📋 What's Included

### ✅ Features
- User authentication (Email, Google, Phone)
- Daily verse display with reflection & wellness tip
- Archive search (40+ Jeremiah verses)
- Verse sharing (copy, social)
- Admin dashboard (add/manage verses)
- Dark mode support
- Mobile responsive
- Firestore database
- Email notifications (optional)

### 📦 Project Structure
```
daily-wisdom-jeremiah/
├── src/
│   ├── App.jsx              # Main React component
│   ├── main.jsx             # Entry point
│   └── index.css            # Styling
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel deployment config
├── jeremiah-verses-db.json # 40+ verses
└── scripts/
    └── load-verses.js      # Bulk load script
```

---

## 🔧 Setup Instructions

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Start dev server**
```bash
npm run dev
```

3. **Visit** http://localhost:5173

4. **Test signup** with email/password

---

## 🌐 Deploy to Vercel

See `DEPLOY_NOW.md` for detailed steps, but basically:

1. Push code to GitHub
2. Go to https://vercel.com/dashboard
3. Import your GitHub repo
4. Click Deploy

Your app is live! 🎉

---

## 📚 Loading Verses

### Option A: Manual (Firebase Console)

1. Go to Firebase Console
2. Firestore → Create collection `verses`
3. Add documents manually from `jeremiah-verses-db.json`

### Option B: Bulk Load (Via Script)

```bash
npm install -g firebase-tools
firebase login
# Prepare serviceAccountKey.json from Firebase Console
node scripts/load-verses.js
```

---

## 🔐 Firebase Setup (Already Done!)

Your Firebase config is in `src/App.jsx`:
- ✅ Email/Password authentication
- ✅ Google Sign-in
- ✅ Phone authentication
- ✅ Firestore database
- ✅ Security rules configured

**Project**: daily-wisdom-jeremiah (512606494351)

---

## 📊 Architecture

```
Daily Wisdom App
├── Frontend (React)
│   ├── Authentication
│   ├── Verse display
│   ├── Archive search
│   └── Admin panel
│
├── Backend (Firebase)
│   ├── Firestore (verses, users)
│   ├── Auth (email, Google, phone)
│   └── Cloud Functions (notifications)
│
└── Hosting (Vercel)
    ├── CDN
    ├── Auto-deploy
    └── Custom domain ready
```

---

## 💾 Database Schema

### `verses` collection
```javascript
{
  chapter: 29,
  verse: 11,
  text: "For I know the plans I have for you...",
  reflection: "In times of uncertainty...",
  wellnessTip: "Take 5 minutes to journal...",
  date: "2026-03-01",
  tags: ["hope", "trust"],
  likes: 0,
  shares: 0
}
```

### `users` collection
```javascript
{
  email: "user@example.com",
  preferences: { notificationsEnabled: true },
  subscribed: true,
  isAdmin: false
}
```

---

## 🎨 Customization

### Change Logo/Branding
Edit `src/App.jsx` — search for "📖" and "Daily Wisdom"

### Change Verses
Add/edit docs in Firestore `verses` collection

### Change Colors
Edit `src/index.css` — modify CSS variables in `:root`

### Change Notification Time
Edit Cloud Function (Firebase Console → Functions)

---

## 📱 Mobile App (Optional)

Convert to iOS/Android with Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
npx cap build ios
```

---

## 📧 Email Notifications (Optional)

1. Sign up for SendGrid (free tier: 100 emails/day)
2. Create Cloud Function in Firebase Console
3. Schedule daily at 7 AM
4. Sends verse to all subscribed users

See `SETUP_GUIDE.md` for detailed instructions.

---

## 🚀 Deployment Checklist

Before launching:
- [ ] Test locally (`npm run dev`)
- [ ] Test signup with email
- [ ] Test archive search
- [ ] Add sample verses to Firestore
- [ ] Deploy to Vercel
- [ ] Test live app
- [ ] Share with community

---

## 📞 Support

### Troubleshooting

**App won't load locally**
```bash
rm -rf node_modules
npm install
npm run dev
```

**Can't sign up**
- Check Firebase Authentication is enabled
- Check browser console (F12) for errors

**No verses showing**
- Verify `verses` collection exists in Firestore
- Check that documents have all required fields

**Build fails**
- Make sure Node 16+ installed: `node --version`
- Try: `npm install` again
- Check for red errors in console

### Getting Help

1. Check `DEPLOY_NOW.md` for deployment issues
2. Check `SETUP_GUIDE.md` for Firebase issues
3. Check browser console (F12) for error messages
4. Check Firebase Console logs

---

## 📄 License

MIT License - Use freely for personal or commercial use.

---

## 🙌 Credits

Built with:
- React (UI)
- Firebase (Backend)
- Vercel (Hosting)
- Vite (Build tool)

---

## 🎯 What's Next?

1. **Deploy** to Vercel (5 min) — See `DEPLOY_NOW.md`
2. **Load verses** (5 min) — Add all 40 Jeremiah passages
3. **Share** — Post app link to your YouTube, Facebook, email list
4. **Grow** — Watch your community engage with daily wisdom

---

**Your Daily Wisdom app is ready. Ship it! 🚀**
