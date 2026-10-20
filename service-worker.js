const CACHE='omnipark-v1';
const CORE=["./", "./index.html", "./manifest.webmanifest", "./three.module.js", "./icon-192.png", "./icon-512.png", "./img/intro.png", "./audio.mp3", "./img/s00.webp"];
const REST=["./img/s01.webp", "./img/s02.webp", "./img/s03.webp", "./img/s04.webp", "./img/s05.webp", "./img/s06.webp", "./img/s07.webp", "./img/s08.webp", "./img/s09.webp", "./img/s10.webp", "./img/s11.webp", "./img/s12.webp", "./img/s13.webp", "./img/s14.webp", "./img/s15.webp", "./img/s16.webp", "./img/s17.webp", "./img/s18.webp", "./img/s19.webp", "./img/s20.webp", "./img/s21.webp", "./img/s22.webp"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{await self.clients.claim();const c=await caches.open(CACHE);let done=0;const total=REST.length;
 for(const u of REST){try{if(!(await c.match(u))){const r=await fetch(u,{cache:'reload'});if(r.ok)await c.put(u,r.clone());}}catch(err){}
  done++;(await self.clients.matchAll()).forEach(x=>x.postMessage({type:'cache',done,total}));}
 (await self.clients.matchAll()).forEach(x=>x.postMessage({type:'cacheDone'}));})());});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
 e.respondWith((async()=>{const c=await caches.open(CACHE);const hit=await c.match(r,{ignoreSearch:true});if(hit)return hit;
  try{const net=await fetch(r);if(net&&net.ok&&new URL(r.url).origin===location.origin)c.put(r,net.clone());return net;}
  catch(err){if(r.mode==='navigate'){const i=await c.match('./index.html');if(i)return i;}throw err;}})());});
