import fs from 'node:fs';
import LZString from 'lz-string';
let slots=0,pages=0;
for(const file of fs.readdirSync('design-source').filter(f=>/^geometry-\d+-\d+\.json$/.test(f))){const id=file.replace(/^geometry-/,'').replace(/\.json$/,'');const input=JSON.parse(fs.readFileSync('design-source/'+file));const fixes=JSON.parse(LZString.decompressFromBase64(input.packed));const d=JSON.parse(fs.readFileSync('public/data/'+id+'.json'));const map=new Map(fixes.rows.map(r=>[r.path,r]));for(const [name,svg] of Object.entries(fixes.assets))fs.writeFileSync('public/assets/'+name,svg);function walk(n,path){const fix=map.get(path);if(fix){n.assetTransform=[...fix.t];n.assetRenderSize=[...fix.b];if(fix.asset)n.asset=fix.asset;
const t=n.assetTransform,det=t[0]*t[3]-t[1]*t[2],a=t[3]/det,b=-t[1]/det,c=-t[2]/det,e=t[0]/det;
const bw=Math.abs(a*n.width)+Math.abs(c*n.height),bh=Math.abs(b*n.width)+Math.abs(e*n.height);
const root=fs.readFileSync('public/assets/'+n.asset,'utf8').match(/<svg\b[^>]*>/)?.[0]??'';const sw=Number(root.match(/\bwidth="([\d.]+)/)?.[1]),sh=Number(root.match(/\bheight="([\d.]+)/)?.[1]);
if(sw&&sh&&Math.abs(sw-bw)+Math.abs(sh-bh)<Math.abs(sw-fix.b[0])+Math.abs(sh-fix.b[1])){const dx=Math.min(0,a*n.width,c*n.height,a*n.width+c*n.height),dy=Math.min(0,b*n.width,e*n.height,b*n.width+e*n.height);n.assetTransform[4]=t[0]*dx+t[2]*dy;n.assetTransform[5]=t[1]*dx+t[3]*dy;n.assetRenderSize=[bw,bh];}
slots++;}(n.children??[]).forEach((c,i)=>walk(c,path+'/'+i));}d.trees.forEach((n,i)=>walk(n,String(i)));fs.writeFileSync('public/data/'+id+'.json',JSON.stringify(d));pages++;}
console.log(JSON.stringify({geometryPages:pages,geometrySlots:slots}));
