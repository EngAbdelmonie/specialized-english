// Service Worker — إنجليزي تخصصي (نسخة عبدالمنعم الشخصية)
// PWA: تخزين هيكل التطبيق للعمل دون اتصال + إشعارات التذكير عبر registration.showNotification.
// لا يوجد خادم دفع (Push Server) — لا إشعارات والمتصفح مغلق تمامًا.
// طلبات Gemini والمحتوى الحي (قاموس/BBC/YouTube) لا تُخزَّن أبدًا — تمر مباشرة للشبكة.
var CACHE = 'esp-pwa-v6';
var CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // أي مصدر خارجي (Gemini، قاموس، BBC، YouTube...): شبكة مباشرة بلا تخزين وبلا تدخل
  if (url.origin !== self.location.origin) return;

  // تنقّل الصفحات: الشبكة أولًا (أحدث نسخة دائمًا)، وعند انقطاعها النسخة المخزنة
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html', { ignoreSearch: true });
      })
    );
    return;
  }

  // الأصول الثابتة (أيقونات/مانيفست): الكاش أولًا مع تحديث في الخلفية
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});

// الضغط على إشعار تذكير يفتح التطبيق أو يركّز نافذته
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(self.registration.scope) === 0) return list[i].focus();
      }
      return self.clients.openWindow(self.registration.scope);
    })
  );
});
