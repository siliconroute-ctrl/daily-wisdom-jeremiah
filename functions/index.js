// Daily Wisdom - scheduled push notification
// Sends the day's verse at 07:00 South Africa time to every user
// who has switched notifications ON (POPIA opt-in) and has a device token.

const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

admin.initializeApp();

// Update this to your custom domain once you have one
// e.g. 'https://dailywisdom.co.za'
const APP_URL = 'https://daily-wisdom-jeremiah.vercel.app';
const APP_NAME = 'Daily Wisdom from Jeremiah';

exports.dailyVersePush = onSchedule(
  { schedule: '0 7 * * *', timeZone: 'Africa/Johannesburg', region: 'europe-west1' },
  async () => {
    const db = admin.firestore();

    // 1. Load verses
    const versesSnap = await db.collection('verses').get();
    const verses = versesSnap.docs
      .map((d) => d.data())
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    if (!verses.length) {
      console.log('No verses in database - nothing to send.');
      return;
    }

    // 2. Pick today's verse
    const today = new Date().toISOString().split('T')[0];
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const verse =
      verses.find((v) => v.date === today) || verses[dayOfYear % verses.length];

    // 3. Collect opted-in device tokens
    const usersSnap = await db
      .collection('users')
      .where('preferences.notificationsEnabled', '==', true)
      .get();

    const tokenMap = {};
    usersSnap.forEach((u) => {
      const t = u.data().fcmToken;
      if (t) tokenMap[t] = u.id;
    });

    const tokens = Object.keys(tokenMap);
    if (!tokens.length) {
      console.log('No opted-in devices. Nothing sent.');
      return;
    }

    // 4. Rich notification payload
    const body =
      verse.text.length > 140 ? verse.text.slice(0, 137) + '...' : verse.text;

    const message = {
      notification: {
        title: APP_NAME,
        body: 'Jeremiah ' + verse.chapter + ':' + verse.verse + ' - ' + body
      },
      webpush: {
        notification: {
          title: APP_NAME,
          body: 'Jeremiah ' + verse.chapter + ':' + verse.verse + '\n' + body,
          icon: APP_URL + '/icon-192.png',
          badge: APP_URL + '/icon-192.png',
          tag: 'daily-verse',
          renotify: true,
          requireInteraction: false,
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: APP_URL
        }
      },
      tokens: tokens
    };

    const result = await admin.messaging().sendEachForMulticast(message);

    // 5. Clean up stale/revoked tokens
    const staleTokens = [];
    result.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error && resp.error.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          staleTokens.push(tokens[idx]);
        }
      }
    });

    if (staleTokens.length) {
      console.log('Cleaning up ' + staleTokens.length + ' stale token(s)...');
      const batch = db.batch();
      staleTokens.forEach((token) => {
        const uid = tokenMap[token];
        if (uid) {
          batch.update(db.collection('users').doc(uid), {
            fcmToken: null,
            'preferences.notificationsEnabled': false
          });
        }
      });
      await batch.commit();
    }

    console.log(
      'Daily verse sent. Success: ' + result.successCount +
      ', failed: ' + result.failureCount +
      ', stale cleaned: ' + staleTokens.length +
      ', total devices: ' + tokens.length
    );
  }
);
