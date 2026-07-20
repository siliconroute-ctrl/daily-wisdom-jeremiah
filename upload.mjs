// UPLOAD SCRIPT - Daily Wisdom from Jeremiah
// Uploads all 40 verses to Firestore automatically.
//
// HOW TO RUN (from your project folder):
//   node upload.mjs
//
// REQUIRES (both in the same folder as this script):
//   1. serviceAccountKey.json  (from Firebase Console)
//   2. jeremiah-verses-db.json (the FIXED verses file)

import { readFileSync, existsSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

console.log('');
console.log('==============================================');
console.log('  DAILY WISDOM - VERSE UPLOADER');
console.log('==============================================');
console.log('');

// ---- Check required files exist BEFORE doing anything ----
if (!existsSync('./serviceAccountKey.json')) {
  console.log('❌ MISSING FILE: serviceAccountKey.json');
  console.log('');
  console.log('   Get it from: Firebase Console > Project Settings >');
  console.log('   Service Accounts > Generate New Private Key');
  console.log('   Save it in this folder as: serviceAccountKey.json');
  process.exit(1);
}

if (!existsSync('./jeremiah-verses-db.json')) {
  console.log('❌ MISSING FILE: jeremiah-verses-db.json');
  console.log('   Download the FIXED version and put it in this folder.');
  process.exit(1);
}

// ---- Load and validate files ----
let serviceAccount, versesData;

try {
  serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  console.log('✅ Found serviceAccountKey.json');
} catch (e) {
  console.log('❌ serviceAccountKey.json is not valid JSON:', e.message);
  process.exit(1);
}

try {
  versesData = JSON.parse(readFileSync('./jeremiah-verses-db.json', 'utf8'));
  console.log('✅ Found jeremiah-verses-db.json (' + versesData.verses.length + ' verses)');
} catch (e) {
  console.log('❌ jeremiah-verses-db.json is not valid JSON:', e.message);
  console.log('   Make sure you downloaded the FIXED version.');
  process.exit(1);
}

// ---- Connect to Firebase ----
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
console.log('✅ Connected to Firebase project: ' + serviceAccount.project_id);
console.log('');
console.log('Uploading...');
console.log('');

// ---- Upload all verses ----
let uploaded = 0;

for (const verse of versesData.verses) {
  await db.collection('verses').doc(String(verse.id)).set({
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text,
    reflection: verse.reflection,
    wellnessTip: verse.wellnessTip,
    date: verse.date,
    tags: verse.tags || [],
    createdAt: new Date(),
    likes: 0,
    shares: 0
  });
  uploaded++;
  console.log('  ✅ ' + uploaded + '/40  Jeremiah ' + verse.chapter + ':' + verse.verse);
}

console.log('');
console.log('==============================================');
console.log('  🎉 DONE! ' + uploaded + ' verses uploaded successfully');
console.log('==============================================');
console.log('');
console.log('Check them: Firebase Console > Firestore > verses');
console.log('Your app:   https://daily-wisdom-jeremiah.vercel.app');
console.log('');
process.exit(0);
