const CACHE_NAME = 'static-cache-v13';
const DATA_CACHE_NAME = 'data-cache-v8';

const FILES_TO_CACHE = [
    "/",
    "index.html",
    "index.js",
    "style.css",
    "/icons/icon-192x192.png",
    "icons/icon-512x512.png",
    "manifest.webmanifest"
];

//install
self.addEventListener('install', evt => { 
    evt.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
        );


    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache =>{
            console.log('Your files were pre-cached successfully');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

//activate
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map( key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// to fetch
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });