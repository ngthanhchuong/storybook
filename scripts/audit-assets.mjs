import fs from 'node:fs';
import crypto from 'node:crypto';
const files=fs.readdirSync('public/data').filter(f=>/^(?:examples-)?\d+-\d+\.json$/.test(f));
const manifest=JSON.parse(fs.readFileSync('src/manifest.json'));
const report={pages:files.filter(f=>!f.startsWith('examples-')).length,examplePages:files.filter(f=>f.startsWith('examples-')).length,componentVariants:0,assetSlots:0,imageSlots:0,uniqueAssets:0,missing:[],geometryWarnings:[]};
const assets=new Set();const refs=new Set();
for(const file of files){const d=JSON.parse(fs.readFileSync('public/data/'+file));const walk=n=>{
 if(n.type==='COMPONENT'&&manifest.find(p=>p.id===d.page.id)?.category==='Components')report.componentVariants++;
 if(n.asset){report.assetSlots++;assets.add(n.asset);const p='public/assets/'+n.asset;if(!fs.existsSync(p)||!fs.statSync(p).size)report.missing.push(p);else{const svg=fs.readFileSync(p,'utf8');const root=svg.match(/<svg\b[^>]*>/)?.[0]??'';const w=Number(root.match(/\bwidth="([\d.]+)/)?.[1]);const h=Number(root.match(/\bheight="([\d.]+)/)?.[1]);if((w&&Math.abs(w-(n.assetRenderSize?.[0]??n.width))>2)||(h&&Math.abs(h-(n.assetRenderSize?.[1]??n.height))>2))report.geometryWarnings.push({file,layer:n.name,asset:n.asset,slot:[n.width,n.height],svg:[w,h]});}}
 for(const f of n.fills??[])if(f.type==='IMAGE'&&f.imageHash){report.imageSlots++;refs.add(f.imageHash);const name=d.assets[f.imageHash];const p='public/assets/'+name;if(!name||!fs.existsSync(p)||!fs.statSync(p).size)report.missing.push({file,layer:n.name,hash:f.imageHash});else{const sha=crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');if(sha!==f.imageHash)report.missing.push({file,layer:n.name,wrongImage:true});}}
 (n.children??[]).forEach(walk);
 };d.trees.forEach(walk);}
for(const f of fs.readdirSync('public/assets')){const p='public/assets/'+f;if(!fs.statSync(p).size)report.missing.push(p);assets.add(f);}
report.uniqueAssets=assets.size;report.uniqueImages=refs.size;
fs.mkdirSync('verification',{recursive:true});fs.writeFileSync('verification/assets.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,geometryWarnings:report.geometryWarnings.slice(0,10)},null,2));if(report.missing.length)process.exitCode=1;
