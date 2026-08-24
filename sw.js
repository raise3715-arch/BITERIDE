/* =========================================================================
   FIREBASE CLOUD MESSAGING â€” BACKGROUND PUSH NOTIFICATIONS
   Lets notifications wake the phone even when the app is fully closed
   ========================================================================= */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCrM5wKwsnGtIc7HSTk_5R1d3dXEcYyd7o",
  authDomain: "texi-and-food.firebaseapp.com",
  databaseURL: "https://texi-and-food-default-rtdb.firebaseio.com",
  projectId: "texi-and-food",
  storageBucket: "texi-and-food.firebasestorage.app",
  messagingSenderId: "98800730432",
  appId: "1:98800730432:web:9d7651e792c60baafabaa5"
});

const messaging = firebase.messaging();

// Fires when a push arrives and the app is closed / backgrounded.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'New order!';
  const options = {
    body: (payload.notification && payload.notification.body) || 'Tap to open the app.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'new-order',
    renotify: true,
    requireInteraction: true,
    data: { url: './' }
  };
  self.registration.showNotification(title, options);
});

/* =========================================================================
   ---- existing cache strategy below (network-first, offline fallback) ----
   ========================================================================= */

const CACHE_NAME = "ruchi-partner-v2";
const APP_SHELL = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation (so live data/menus stay fresh),
// falling back to the cached shell when offline.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./index.html");
    })
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
