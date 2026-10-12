import fs from 'node:fs';
import path from 'node:path';
import LZString from 'lz-string';
const root=process.cwd();const source=path.join(root,'design-source');
fs.mkdirSync('public/data',{recursive:true});fs.mkdirSync('public/assets',{recursive:true});fs.mkdirSync('src/generated',{recursive:true});
const pages=JSON.parse(fs.readFileSync(path.join(source,'pages.json'),'utf8')).filter(p=>p.name.startsWith('↳'));
const manifest=[];const images={};const pending=[];
function unpack(prefix){const first=JSON.parse(fs.readFileSync(path.join(source,prefix+'-0.json'),'utf8'));let packed=first.chunk;for(let i=1;i<Math.ceil(first.length/16000);i++){const f=path.join(source,prefix+'-'+i+'.json');if(!fs.existsSync(f))return null;packed+=JSON.parse(fs.readFileSync(f,'utf8')).chunk;}const data=LZString.decompressFromBase64(packed);if(!data)throw Error('Invalid compressed export: '+prefix);return JSON.parse(data);}
for(let pageIndex=0;pageIndex<pages.length;pageIndex++){
 const p=pages[pageIndex];const id=p.id.replace(':','-');let data;
 if(['3210:20947','1541:233061'].includes(p.id)){
  const prefixes=fs.readdirSync(source).filter(f=>f.startsWith('asset-'+id+'-')&&f.endsWith('-0.json')).sort((a,b)=>Number(a.split('-').at(-2))-Number(b.split('-').at(-2)));
  if(!prefixes.length){pending.push(p.name);continue;}
  const batches=prefixes.map(f=>unpack(f.replace(/-0.json$/,'')));
  if(batches.some(b=>!b)){pending.push(p.name);continue;}
  data={page:batches[0].page,trees:batches.flatMap(b=>b.trees),assets:Object.assign({},...batches.map(b=>b.assets)),imageRefs:Object.assign({},...batches.map(b=>b.imageRefs))};
  const expected=p.id==='3210:20947'?738:119;if(data.trees.length!==expected){pending.push(`${p.name}: ${data.trees.length}/${expected}`);continue;}
 }else{data=unpack('export-'+id);if(!data){pending.push(p.name);continue;}}
 for(const [name,svg] of Object.entries(data.assets)){if(!svg.includes('<svg'))throw Error('Invalid SVG '+name);fs.writeFileSync(path.join('public/assets',name),svg);}
 Object.assign(images,data.imageRefs);
 data.assets=fs.existsSync('public/data/images.json')?JSON.parse(fs.readFileSync('public/data/images.json','utf8')):{};
 fs.writeFileSync(path.join('public/data',id+'.json'),JSON.stringify(data));
 const category=pageIndex<8?'Foundations':'Components';const name=p.name.replace(/^↳\s*/,'');
 const groups=data.trees.map((t,index)=>({id:t.id,name:t.name,type:t.type,variants:t.type==='COMPONENT_SET'?(t.children??[]).map(c=>({id:c.id,name:c.name,properties:c.variantProperties??{}})):[{id:t.id,name:t.name,properties:t.variantProperties??{}}],definitions:t.definitions??{},index}));
 manifest.push({id:p.id,name,category,groups});
 if(category==='Foundations'&&['Icons','Brands Logos'].includes(name)){
  const file=`import { FoundationAssets } from '../FoundationAssets';\nexport default {title:${JSON.stringify(category+'/'+name)},parameters:{layout:'padded'}};\nexport const Catalog={render:()=> <FoundationAssets pageId=${JSON.stringify(p.id)} />};\n`;
  fs.writeFileSync(`src/generated/${id}.stories.tsx`,file);
  continue;
 }
 for(const group of groups){
  const variants=group.variants;const defaults={};const argTypes={};
  for(const [key,d] of Object.entries(group.definitions)){if(d.type==='VARIANT'){defaults[key]=String(d.defaultValue);argTypes[key]={control:'select',options:d.variantOptions};}}
  if(!Object.keys(defaults).length)Object.assign(defaults,variants[0]?.properties??{});
  const title=category+'/'+name+(groups.length>1?'/'+group.name.replaceAll('/',' · '):'');
  const argsType=`Record<string,string>`;
  let code=`import { CatalogStory } from '../Scene';\nimport type { Meta,StoryObj } from '@storybook/react-vite';\nconst meta:Meta<${argsType}>={title:${JSON.stringify(title)},args:${JSON.stringify(defaults)},argTypes:${JSON.stringify(argTypes)},parameters:{figma:{url:${JSON.stringify('https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id='+group.id.replace(':','-'))}}},render:(args)=> <CatalogStory pageId=${JSON.stringify(p.id)} groupId=${JSON.stringify(group.id)} properties={args}/>};\nexport default meta;\ntype Story=StoryObj<typeof meta>;\nexport const Playground:Story={};\nexport const AllVariants:Story={name:'All variants ('+${variants.length}+')',render:()=> <CatalogStory pageId=${JSON.stringify(p.id)} groupId=${JSON.stringify(group.id)} gallery/>};\n`;
  variants.forEach((v,index)=>{code+=`export const Variant${String(index+1).padStart(3,'0')}:Story={name:${JSON.stringify(v.name)},args:${JSON.stringify(v.properties)},render:(args)=><CatalogStory pageId=${JSON.stringify(p.id)} groupId=${JSON.stringify(group.id)} properties={args}/>};\n`;});
  fs.writeFileSync(`src/generated/${id}-${group.index}.stories.tsx`,code);
 }
}
fs.writeFileSync('src/manifest.json',JSON.stringify(manifest,null,2));fs.writeFileSync('design-source/image-refs.json',JSON.stringify(images,null,2));
console.log(JSON.stringify({pages:manifest.length,groups:manifest.reduce((s,p)=>s+p.groups.length,0),variants:manifest.filter(p=>p.category==='Components').reduce((s,p)=>s+p.groups.reduce((c,g)=>c+g.variants.length,0),0),images:Object.keys(images).length,pending},null,2));
