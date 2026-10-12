import fs from 'node:fs';
let count=0;
for(const f of fs.readdirSync('design-source').filter(f=>/^strokes-\d+-\d+\.json$/.test(f))){const id=f.replace(/^strokes-/,'');const file='public/data/'+id;const page=JSON.parse(fs.readFileSync(file));const rows=JSON.parse(fs.readFileSync('design-source/'+f));const map=new Map(rows.map(r=>[r.path,r.sw]));function walk(n,path){if(map.has(path)){n.strokeWeights=map.get(path);count++;}(n.children??[]).forEach((c,i)=>walk(c,path+'/'+i));}page.trees.forEach((n,i)=>walk(n,String(i)));fs.writeFileSync(file,JSON.stringify(page));}
console.log('Corrected individual border edges: '+count);
