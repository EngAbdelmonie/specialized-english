// Service Worker — إنجليزي تخصصي (نسخة عبدالمنعم الشخصية)
// وجوده يتيح إظهار إشعارات التذكير عبر registration.showNotification أثناء فتح الموقع.
// لا يوجد خادم دفع (Push Server) — لا إشعارات والمتصفح مغلق تمامًا.
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){ /* passthrough */ });
