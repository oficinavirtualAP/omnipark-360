const CACHE='omnipark-v2';
const OLDS=['omnipark-v1'];
const FRESH=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-512-maskable.png"];
const CORE=["./three.module.js","./img/intro.png","./audio.mp3","./img/s00.webp"];
const REST=["./img/s01.webp","./img/s02.webp","./img/s03.webp","./img/s04.webp","./img/s05.webp","./img/s06.webp","./img/s07.webp","./img/s08.webp","./img/s09.webp","./img/s10.webp","./img/s11.webp","./img/s12.webp","./img/s13.webp","./img/s14.webp","./img/s15.webp","./img/s16.webp","./img/s17.webp","./img/s18.webp","./img/s19.webp","./img/s20.webp","./img/s21.webp","./img/s22.webp"];

function leaf(u){var p=u.replace('./','');return p;}
function isFresh(reqUrl){
 try{var path=new URL(reqUrl).pathname;
  for(var i=0;i<FRESH.length;i++){var f=leaf(FRESH[i]);
   if(f===''){if(/\/$/.test(path))return true;}
   else if(path.slice(-(f.length+1))==='/'+f)return true;}
 }catch(e){}
 return false;
}

self.addEventListener('install',function(e){e.waitUntil((async function(){
 const c=await caches.open(CACHE);
 await Promise.all(FRESH.map(async function(u){
  try{const r=await fetch(u,{cache:'reload'});if(r&&r.ok)await c.put(u,r.clone());}catch(err){}
 }));
 await self.skipWaiting();
})());});

self.addEventListener('activate',function(e){e.waitUntil((async function(){
 await self.clients.claim();
 const c=await caches.open(CACHE);

 // Migrar lo pesado desde la cache anterior sin volver a descargarlo
 for(const name of OLDS){
  try{
   if(!(await caches.has(name)))continue;
   const old=await caches.open(name);
   for(const req of await old.keys()){
    if(isFresh(req.url))continue;
    if(await c.match(req))continue;
    const r=await old.match(req);
    if(r)await c.put(req,r.clone());
   }
   await caches.delete(name);
  }catch(err){}
 }

 // Completar lo que falte (primera instalacion o huecos de la migracion)
 const need=CORE.concat(REST);
 let done=0;const total=need.length;
 for(const u of need){
  try{if(!(await c.match(u))){const r=await fetch(u,{cache:'reload'});if(r&&r.ok)await c.put(u,r.clone());}}catch(err){}
  done++;
  (await self.clients.matchAll()).forEach(function(x){x.postMessage({type:'cache',done:done,total:total});});
 }
 (await self.clients.matchAll()).forEach(function(x){x.postMessage({type:'cacheDone'});});
})());});

self.addEventListener('fetch',function(e){
 const r=e.request;if(r.method!=='GET')return;
 e.respondWith((async function(){
  const c=await caches.open(CACHE);
  const hit=await c.match(r,{ignoreSearch:true});
  if(hit)return hit;
  try{
   const net=await fetch(r);
   if(net&&net.ok&&new URL(r.url).origin===location.origin)c.put(r,net.clone());
   return net;
  }catch(err){
   if(r.mode==='navigate'){const i=await c.match('./index.html');if(i)return i;}
   throw err;
  }
 })());
});
