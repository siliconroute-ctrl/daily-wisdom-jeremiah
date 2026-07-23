// Daily Wisdom - scheduled push notification
// Sends the day's verse at 07:00 South Africa time to every user
// who has switched notifications ON (POPIA opt-in) and has a device token.

const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

admin.initializeApp();

exports.dailyVersePush = onSchedule(
  { schedule: '0 7 * * *', timeZone: 'Africa/Johannesburg', region: 'europe-west1' },
  async () => {
    const db = admin.firestore();

    // 1. Load verses, same ordering as the app
    const versesSnap = await db.collection('verses').get();
    const verses = versesSnap.docs
      .map((d) => d.data())
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    if (!verses.length) {
      console.log('No verses in database - nothing to send.');
      return;
    }

    // 2. Pick today's verse using the SAME rotation as the app
    const today = new Date().toISOString().split('T')[0];
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const verse =
      verses.find((v) => v.date === today) || verses[dayOfYear % verses.length];

    // 3. Collect device tokens - ONLY users who opted in
    const usersSnap = await db
      .collection('users')
      .where('preferences.notificationsEnabled', '==', true)
      .get();

    const tokens = [];
    usersSnap.forEach((u) => {
      const t = u.data().fcmToken;
      if (t) tokens.push(t);
    });

    if (!tokens.length) {
      console.log('No opted-in devices. Nothing sent.');
      return;
    }

    // 4. Send the notification
    const body =
      verse.text.length > 150 ? verse.text.slice(0, 147) + '…' : verse.text;

    const result = await admin.messaging().sendEachForMulticast({
      notification: {
        title: 'Jeremiah ' + verse.chapter + ':' + verse.verse,
        body: body
      },
      tokens: tokens
    });

    console.log(
      'Daily verse sent. Success: ' +
        result.successCount +
        ', failed: ' +
        result.failureCount +
        ', total devices: ' +
        tokens.length
    );
  }
);
