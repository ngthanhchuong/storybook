import fs from 'node:fs';
const variables=JSON.parse(fs.readFileSync('public/data/variables.json','utf8'));
const css=['/* Original Figma variables · The Layout Lab Design System Pro 1.0 */',':root {'];const tokens={};
for(const t of variables){const v=Object.values(t.values)[0];const name=t.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');let value;
 if(t.type==='COLOR'){value='#'+[v.r,v.g,v.b].map(c=>Math.round(c*255).toString(16).padStart(2,'0')).join('');}
 else value=typeof v==='number'?v+'px':String(v);
 const prefix=t.collectionId.includes('195893')?'radius-':t.collectionId.includes('195780')?'space-':t.collectionId.includes('195810')?'container-':'';
 css.push(`  --ll-${prefix}${name}: ${value};`);tokens[`${prefix}${t.name}`]={value,type:t.type,figmaId:t.id};
}css.push('}');fs.writeFileSync('public/tokens.css',css.join('\n')+'\n');fs.writeFileSync('src/tokens.css',css.join('\n')+'\n');fs.writeFileSync('public/data/tokens.json',JSON.stringify(tokens,null,2));
console.log('Exported '+variables.length+' tokens.');
