# Deploy Daily Wisdom to Vercel — 5 Minutes

You now have a **complete, ready-to-deploy app** with Firebase configured.

---

## Prerequisites

- Node.js 16+ installed: https://nodejs.org
- GitHub account (free)
- Vercel account (free): https://vercel.com (sign up with GitHub)

---

## Step 1: Create GitHub Repository (1 minute)

1. Go to: https://github.com/new
2. Repository name: `daily-wisdom-jeremiah`
3. Description: "Daily Wisdom from Jeremiah - Daily verses and reflections"
4. Choose: **Public** (so you can link to Vercel)
5. Click **Create repository**

---

## Step 2: Upload Your Files to GitHub (2 minutes)

You have two options:

### Option A: Using Git Command Line (Fastest)

```bash
# Navigate to your project folder
cd daily-wisdom-jeremiah

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Daily Wisdom app with Firebase"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/daily-wisdom-jeremiah.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop (Easier if you prefer GUI)

1. Download GitHub Desktop: https://desktop.github.com
2. File → Clone Repository → Select your new repo
3. Open in folder → Paste all your project files there
4. In GitHub Desktop: Add all files → Commit → Publish

---

## Step 3: Deploy to Vercel (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select: `daily-wisdom-jeremiah`
5. Click **Import**

**Vercel will auto-detect it's a Vite project — just accept defaults**

6. Click **"Deploy"**

**Wait 1-2 minutes...**

You'll see: ✅ **Deployment successful!**

Your app is now live at: `https://daily-wisdom-jeremiah.vercel.app` (or similar)

---

## Step 4: Test Your Live App (1 minute)

1. Click the deployment link
2. You should see: **"Daily Wisdom from Jeremiah"** login page
3. Sign up: `test@example.com` / `testpassword123`
4. You should see today's verse!

---

## Step 5: Add Verses to Firestore (Optional but Recommended)

Your app is live, but it needs verses! Here's how to add them:

**In Firebase Console:**
1. Go to: https://console.firebase.google.com
2. Select: `daily-wisdom-jeremiah` project
3. Click: **Firestore Database** → **Collection** → **Create collection**
4. Name it: `verses`
5. Click: **Auto ID**
6. Add a test verse:

```
chapter: 29
verse: 11
text: For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.
reflection: In times of uncertainty, remember that God's plans are intentional and rooted in hope.
wellnessTip: Take 5 minutes to journal about one hope you're holding onto.
date: 2026-03-01
```

7. Click **Save**

Now reload your Vercel app and you should see the verse!

---

## ✅ You're Done! 

**Your app is:**
- ✅ Live on the internet
- ✅ Using Firebase authentication
- ✅ Connected to Firestore database
- ✅ Ready for users

---

## Next Steps

### Add More Verses
Load all 40 Jeremiah verses from `jeremiah-verses-db.json` into Firestore

### Share with Community
Post your app link to:
- Your YouTube community
- Your Facebook page/group (Nigeria, West Africa, Brazil audiences)
- WhatsApp groups
- Email newsletter

### Add Email Notifications (Optional)
Users get daily verses at 7 AM via email. Requires:
1. SendGrid account (free: 100 emails/day)
2. Firebase Cloud Function
3. ~20 minutes to set up

---

## Troubleshooting

**"Vercel deployment failed"**
- Check: `npm run build` works locally
- Make sure `dist/` folder is created
- Check console for any errors

**"Can't sign up"**
- Verify Firebase Authentication is enabled
- Check browser console (F12) for error messages

**"No verses showing"**
- Did you create the `verses` collection in Firestore?
- Did you add documents to it?

**"App looks broken"**
- Try clearing browser cache (Ctrl+Shift+Delete)
- Check that CSS is loading (look for colors)

---

## How to Update Your App

Every time you make changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel auto-deploys within 1-2 minutes!

---

**🎉 Your Daily Wisdom app is live!**

Share the link with your community and watch it grow! 🚀
