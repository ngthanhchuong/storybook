import fs from 'node:fs';
import crypto from 'node:crypto';
const refs=JSON.parse(fs.readFileSync('design-source/image-downloads.json','utf8'));
const map={};const records=[];const urls=[...new Map(refs.flatMap(r=>r.images??[]).map(i=>[i.url,i])).values()];
await Promise.all(urls.map(async image=>{const r=await fetch(image.url);if(!r.ok)throw Error('Asset download failed: '+r.status);const bytes=Buffer.from(await r.arrayBuffer());if(!bytes.length)throw Error('Empty asset');const hash=crypto.createHash('sha1').update(bytes).digest('hex');const name=hash+'.'+image.format;fs.writeFileSync('public/assets/'+name,bytes);map[hash]=name;records.push({hash,name,bytes:bytes.length});}));
const missing=refs.filter(r=>!map[r.hash]);
fs.writeFileSync('public/data/images.json',JSON.stringify(map));fs.writeFileSync('design-source/image-checks.json',JSON.stringify(records,null,2));
for(const file of fs.readdirSync('public/data')){if(!/^\d+-\d+\.json$/.test(file))continue;const data=JSON.parse(fs.readFileSync('public/data/'+file));data.assets=map;fs.writeFileSync('public/data/'+file,JSON.stringify(data));}
console.log(JSON.stringify({downloaded:records.length,requested:refs.length,missing:missing.map(r=>r.hash)},null,2));if(missing.length)process.exitCode=1;
