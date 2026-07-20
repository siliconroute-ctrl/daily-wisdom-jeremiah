// Firebase Cloud Messaging service worker
// This file MUST be at: public/firebase-messaging-sw.js
// It lets your app receive the daily verse notification even when closed.

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAbknRkscPA1kcXXKN0EXXLtVugryHOUvE",
  authDomain: "daily-wisdom-jeremiah.firebaseapp.com",
  projectId: "daily-wisdom-jeremiah",
  storageBucket: "daily-wisdom-jeremiah.firebasestorage.app",
  messagingSenderId: "512606494351",
  appId: "1:512606494351:web:bec63c73473e3e68de9afa"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const title = (payload.notification && payload.notification.title) || 'Daily Wisdom';
  const options = {
    body: (payload.notification && payload.notification.body) || 'Your verse for today is ready.',
    icon: '/vite.svg',
    badge: '/vite.svg'
  };
  self.registration.showNotification(title, options);
});
