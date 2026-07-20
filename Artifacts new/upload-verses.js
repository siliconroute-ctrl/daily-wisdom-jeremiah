const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const verses = require('./jeremiah-verses-db.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadVerses() {
  console.log('Starting to upload verses...');
  console.log(`Found ${verses.verses.length} verses to upload\n`);
  
  try {
    for (const verse of verses.verses) {
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
      console.log(`✅ Uploaded: Jeremiah ${verse.chapter}:${verse.verse}`);
    }
    
    console.log('\n🎉 All verses uploaded successfully!');
    console.log(`Total: ${verses.verses.length} verses`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading verses:', error);
    process.exit(1);
  }
}

uploadVerses();
