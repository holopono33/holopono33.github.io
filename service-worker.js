const CACHE_NAME = "flag-quiz-v5-20260319";// ←さらに1回変えてください

const urlsToCache = [
  "./",
  "./index.html",
  "./main.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ===== ここ追加（flags）=====
const flagCodes = [
  "is","ie","az","af","us","ae","dz","ar","al","am","ao","ag","ad","ye","gb","il","it","ir","in","id","ug","ua","uz","uy","ec","eg","ee",
  "sz","et","er","sv","au","at","om","nl","gh","cv","gy","kz","qa","ca","ga","cm","gm","kh","gn","gw","cy","gr","ki","kg","gt","kw","gd",
  "hr","ke","cr","km","co","cg","cd","sa","ws","st","zm","sm","sl","dj","jm","ge","sy","sg","w}","ch","se","sd","es","sr","lk","sk","si",
  "sc","sn","rs","kn","vc","lc","so","sb","th","tj","tz","cz","td","tn","cl","tv","dk","de","tg","do","dm","tt","tm","tr","to","ng","nr",
  "na","ni","ne","nz","np","no","bh","ht","pk","va","pa","vu","bs","pg","pw","py","bb","hu","bd","fj","ph","fi","bt","br","fr","bg","bf",
  "bn","bi","vn","bj","ve","by","bz","pe","be","pl","ba","bw","bo","pt","hn","mh","mg","mw","ml","mt","my","fm","mm","mx","mu","mr","mz",
  "mc","mv","md","ma","me","jo","la","lv","lt","ly","li","lr","ro","lu","rw","ls","lb","ru","kr","gq","cf","cn","tl","za","ss","jp","mk",
  "kp","cu","iq","mn","tw","xk","nu","ci","ck"
 // ←ここに使う国コードを追加
];

const flagFiles = flagCodes.map(code => "./flags/" + code + ".png");
// ============================

self.addEventListener("install", event => {
  self.skipWaiting(); // ←追加

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        ...urlsToCache,
        ...flagFiles   // ←ここ追加
      ]);
    })
  );
});

// ★これを追加（超重要）
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
