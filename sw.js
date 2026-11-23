/* Stryve Track service worker: lets the app install and open without a connection.
   Network first, so a new version on GitHub is always picked up when online. */
var CACHE="stryve-shell-v1";
var SHELL=["./","index.html","manifest.json","icon.png","icon-192.png","apple-touch-icon.png","icon-maskable.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(function(res){
    if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(r,copy)})}
    return res;
  }).catch(function(){return caches.match(r).then(function(m){return m||caches.match("index.html")})}));
});
