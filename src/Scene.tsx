import React, { useEffect, useId, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export type Paint = { type: string; color?: { r: number; g: number; b: number; a?: number }; opacity?: number; imageHash?: string; scaleMode?: string; gradientStops?: { position: number; color: { r: number; g: number; b: number; a?: number } }[]; gradientTransform?: number[][]; imageTransform?: number[][] };
export type DesignNode = {
  id?: string; name: string; type: string; width: number; height: number; x?: number; y?: number;
  asset?: string; assetTransform?: number[]; isMask?: boolean; children?: DesignNode[]; fills?: Paint[]; strokes?: Paint[]; strokeWeight?: number; strokeAlign?: string;
  strokeWeights?: number[];
  cornerRadius?: number; topLeftRadius?: number; topRightRadius?: number; bottomLeftRadius?: number; bottomRightRadius?: number;
  layoutMode?: string; layoutSizingHorizontal?: string; layoutSizingVertical?: string; layoutPositioning?: string; layoutGrow?: number; layoutAlign?: string;
  primaryAxisAlignItems?: string; counterAxisAlignItems?: string; itemSpacing?: number; counterAxisSpacing?: number; layoutWrap?: string;
  paddingTop?: number; paddingRight?: number; paddingBottom?: number; paddingLeft?: number; clipsContent?: boolean; opacity?: number;
  characters?: string; fontName?: { family: string; style: string }; fontSize?: number; fontWeight?: number;
  lineHeight?: { unit: string; value?: number }; letterSpacing?: { unit: string; value?: number }; textAlignHorizontal?: string; textAlignVertical?: string; textAutoResize?: string; textDecoration?: string;
  effects?: {type:string; visible?:boolean; color?:{r:number;g:number;b:number;a?:number};offset?:{x:number;y:number};radius?:number;spread?:number}[];
  relativeTransform?: number[][]; variantProperties?: Record<string,string>; definitions?: Record<string,{type:string;defaultValue:string|boolean;variantOptions?:string[]}>;
  segments?: (Partial<DesignNode> & {characters:string})[];
};
export type DesignPage = { page:{id:string;name:string}; trees:DesignNode[]; assets:Record<string,string>; imageRefs:Record<string,string> };
const cache = new Map<string, Promise<DesignPage>>();
export function loadPage(id:string) {
  if (!cache.has(id)) cache.set(id, fetch(`./data/${id.replace(':','-')}.json`).then(r=>{if(!r.ok)throw Error(`Unable to load design data (${r.status})`);return r.json();}));
  return cache.get(id)!;
}
export function color(c?: {r:number;g:number;b:number;a?:number}, opacity=1) {
  if (!c) return 'transparent';
  return `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${(c.a??1)*opacity})`;
}
export function paint(p?:Paint):string {
  if(!p) return 'transparent';
  if(p.type==='SOLID')return color(p.color,p.opacity);
  if(p.gradientStops){const stops=p.gradientStops.map(s=>`${color(s.color,p.opacity)} ${s.position*100}%`).join(',');return p.type==='GRADIENT_RADIAL'?`radial-gradient(${stops})`:`linear-gradient(180deg,${stops})`;}
  return 'transparent';
}
function font(n:Partial<DesignNode>):CSSProperties{
 const family=n.fontName?.family;
 return {fontFamily:family==='Inter'?'"Inter Variable",Inter,sans-serif':family==='Inter Tight'?'"Inter Tight Variable","Inter Tight",sans-serif':family?`"${family}",sans-serif`:undefined,
  fontSize:n.fontSize,fontWeight:n.fontWeight??(/Bold/.test(n.fontName?.style??'')?700:/Medium/.test(n.fontName?.style??'')?500:400),
  fontStyle:/Italic/.test(n.fontName?.style??'')?'italic':undefined,
  lineHeight:n.lineHeight?.unit==='PERCENT'?`${n.lineHeight.value}%`:n.lineHeight?.unit==='PIXELS'?`${n.lineHeight.value}px`:'normal',
  letterSpacing:n.letterSpacing?.unit==='PERCENT'?`${(n.letterSpacing.value??0)/100}em`:n.letterSpacing?.value,
  color:n.fills?.[0]?.type==='SOLID'?paint(n.fills[0]):undefined,
  textAlign:(n.textAlignHorizontal?.toLowerCase()??'left') as CSSProperties['textAlign'],
  textDecoration:n.textDecoration==='UNDERLINE'?'underline':n.textDecoration==='STRIKETHROUGH'?'line-through':undefined};
}
const alignment:Record<string,string>={MIN:'flex-start',MAX:'flex-end',CENTER:'center',SPACE_BETWEEN:'space-between',BASELINE:'baseline'};
function nodeStyle(n:DesignNode,parent?:DesignNode,root=false,childIndex=0):CSSProperties {
 const auto=n.layoutMode==='HORIZONTAL'||n.layoutMode==='VERTICAL';
 const parentAuto=parent?.layoutMode==='HORIZONTAL'||parent?.layoutMode==='VERTICAL';
 const abs=!root&&(!parentAuto||n.layoutPositioning==='ABSOLUTE');
 const fill=n.fills?.filter(p=>p.type!=='IMAGE').map(paint)??[];
 const s:CSSProperties={position:abs?'absolute':'relative',width:n.width,height:n.height,flexShrink:0,margin:0,boxSizing:'border-box',opacity:n.opacity,overflow:n.clipsContent?'hidden':undefined};
 if(abs){s.left=n.x??0;s.top=n.y??0;}
 if(!abs&&childIndex>0&&(parent?.itemSpacing??0)<0){if(parent?.layoutMode==='HORIZONTAL')s.marginLeft=parent.itemSpacing;else s.marginTop=parent?.itemSpacing;}
 if(auto){s.display='flex';s.flexDirection=n.layoutMode==='VERTICAL'?'column':'row';s.gap=Math.max(n.itemSpacing??0,0);s.justifyContent=alignment[n.primaryAxisAlignItems??'MIN'];s.alignItems=alignment[n.counterAxisAlignItems??'MIN'];s.padding=`${n.paddingTop??0}px ${n.paddingRight??0}px ${n.paddingBottom??0}px ${n.paddingLeft??0}px`;if(n.layoutWrap==='WRAP'){s.flexWrap='wrap';s.rowGap=n.counterAxisSpacing??n.itemSpacing??0;}}
 if(n.layoutSizingHorizontal==='FILL'&&parentAuto&&!abs){if(parent?.layoutMode==='HORIZONTAL'){s.flexGrow=1;s.flexBasis=0;s.minWidth=0;s.width=undefined;}else{s.alignSelf='stretch';s.width=undefined;}}
 if(n.layoutSizingVertical==='FILL'&&parentAuto&&!abs){if(parent?.layoutMode==='VERTICAL'){s.flexGrow=1;s.flexBasis=0;s.minHeight=0;s.height=undefined;}else{s.alignSelf='stretch';s.height=undefined;}}
 if(n.layoutSizingHorizontal==='HUG'&&auto)s.width='max-content';
 if(n.layoutSizingVertical==='HUG'&&auto)s.height='max-content';
 if(n.layoutAlign==='STRETCH'){s.alignSelf='stretch';if(parent?.layoutMode==='VERTICAL')s.width=undefined;else s.height=undefined;}
 if(n.layoutGrow)s.flexGrow=n.layoutGrow;
 if(fill.length){if(fill.some(f=>f.includes('gradient'))){s.background=fill.join(',');}else s.backgroundColor=fill[fill.length-1];}
 const stroke=n.strokes?.[0];
 if(stroke){const width=n.strokeWeight??1;s.boxShadow=n.strokeAlign==='OUTSIDE'?`0 0 0 ${width}px ${paint(stroke)}`:`inset 0 0 0 ${width}px ${paint(stroke)}`;}
 if(stroke&&n.strokeWeights){const [top,right,bottom,left]=n.strokeWeights;const ink=paint(stroke);s.boxShadow=[top?`inset 0 ${top}px 0 ${ink}`:'',right?`inset -${right}px 0 0 ${ink}`:'',bottom?`inset 0 -${bottom}px 0 ${ink}`:'',left?`inset ${left}px 0 0 ${ink}`:''].filter(Boolean).join(',')||undefined;}
 s.borderRadius=n.type==='ELLIPSE'?'50%':`${n.topLeftRadius??n.cornerRadius??0}px ${n.topRightRadius??n.cornerRadius??0}px ${n.bottomRightRadius??n.cornerRadius??0}px ${n.bottomLeftRadius??n.cornerRadius??0}px`;
 if(n.effects?.length){const shadows=n.effects.filter(e=>e.visible!==false&&(e.type==='DROP_SHADOW'||e.type==='INNER_SHADOW')).map(e=>`${e.type==='INNER_SHADOW'?'inset ':''}${e.offset?.x??0}px ${e.offset?.y??0}px ${e.radius??0}px ${e.spread??0}px ${color(e.color)}`);if(shadows.length)s.boxShadow=[s.boxShadow,...shadows].filter(Boolean).join(',');}
 if(n.relativeTransform){const m=n.relativeTransform;if(Math.abs(m[0][0]-1)>.0001||Math.abs(m[1][1]-1)>.0001||Math.abs(m[0][1])>.0001||Math.abs(m[1][0])>.0001){s.transform=`matrix(${m[0][0]},${m[1][0]},${m[0][1]},${m[1][1]},0,0)`;s.transformOrigin='top left';}}
 if(n.type==='TEXT'){
  Object.assign(s,font(n));s.background=undefined;s.backgroundColor=undefined;
  s.whiteSpace=n.textAutoResize==='WIDTH_AND_HEIGHT'?'pre':'pre-wrap';
  if(n.textAutoResize==='WIDTH_AND_HEIGHT'){s.width=n.width;s.height=n.height;}
  else if(n.textAutoResize==='HEIGHT')s.height='auto';
 }
 return s;
}
type RenderOptions={imageMap:Record<string,string>;editable?:boolean;disabled?:boolean;fieldId?:string;label?:string;value?:string;setValue?:(v:string)=>void;inputType?:string;};
function renderNode(n:DesignNode,parent:DesignNode|undefined,root:boolean,options:RenderOptions,rootTag?:'button'|'div',childIndex=0):ReactNode {
 if(n.isMask) return null;
 const style=nodeStyle(n,parent,root,childIndex);
 if(n.asset){const a=n.assetTransform;return <span key={n.id??`${n.name}-${childIndex}`} style={{...style,background:undefined,backgroundColor:undefined,boxShadow:undefined,padding:0,display:'block'}} data-design-layer={n.name}><img src={`./assets/${n.asset}`} alt="" draggable={false} style={{display:'block',...(a?{position:'absolute',left:a[4],top:a[5],transform:`matrix(${a[0]},${a[1]},${a[2]},${a[3]},0,0)`,transformOrigin:'0 0'}:{})}}/></span>;}
 const image=n.fills?.find(f=>f.type==='IMAGE');
 if(image?.imageHash){style.backgroundImage=`url("./assets/${options.imageMap[image.imageHash]}")`;style.backgroundSize=image.scaleMode==='FIT'?'contain':image.scaleMode==='TILE'?'auto':'cover';style.backgroundPosition='center';style.backgroundRepeat=image.scaleMode==='TILE'?'repeat':'no-repeat';}
 if(n.type==='TEXT'){
  const editable=options.editable&&(/placeholder|input text|search for|search here|enter |your email/i.test(n.characters??'')||n.characters==='|')&&!/helper|hint|label/i.test(n.name);
  if(editable)return <input key="editable-field" id={options.fieldId} aria-label={options.label??'Input'} className="lab-native-input" style={{...style,flexGrow:1,minWidth:0,width:undefined}} type={options.inputType??'text'} disabled={options.disabled} placeholder={n.characters==='|'?'':n.characters} value={options.value??''} onChange={e=>options.setValue?.(e.target.value)}/>;
  return <span key={n.id??`${n.name}-${childIndex}`} style={style} data-design-layer={n.name}>{n.segments?n.segments.map((seg,i)=><span key={i} style={font(seg)}>{seg.characters}</span>):n.characters}</span>;
 }
 if(n.type==='LINE'){style.height=0;style.borderTop=`${n.strokeWeight??1}px solid ${paint(n.strokes?.[0])}`;style.boxShadow=undefined;}
 const children=n.children?.map((c,i)=>renderNode(c,n,false,options,undefined,i));
 const Tag=root?(rootTag??'div'):'div';
 return <Tag key={root?'root':n.id??`${n.name}-${childIndex}`} className={root&&/spinner/i.test(options.label??'')?'lab-spinner':undefined} style={{...style,...(rootTag==='button'&&root?{border:0,font:'inherit',color:'inherit'}:{})}} data-design-layer={n.name} disabled={Tag==='button'?options.disabled:undefined} type={Tag==='button'?'button':undefined} aria-label={Tag==='button'&&/Icon Only=True/.test(n.name)?options.label:undefined}>{children}</Tag>;
}
export function Scene({node,imageMap={},editable=false,label,disabled=false,rootTag='div'}:{node:DesignNode;imageMap?:Record<string,string>;editable?:boolean;label?:string;disabled?:boolean;rootTag?:'button'|'div'}){
 const [value,setValue]=useState('');const fieldId=useId();
 return <div className="lab-scene" data-figma-node={node.id}>{renderNode(node,undefined,true,{imageMap,editable,label,disabled,value,setValue,fieldId,inputType:/number/i.test(label??'')?'number':'text'},rootTag)}</div>;
}
export function CatalogStory({pageId,groupId,properties={},gallery=false,variantId}:{pageId:string;groupId:string;properties?:Record<string,string>;gallery?:boolean;variantId?:string}){
 const [page,setPage]=useState<DesignPage>();const [error,setError]=useState('');const [query,setQuery]=useState('');const [live,setLive]=useState<Record<string,string>>({});
 useEffect(()=>{let active=true;loadPage(pageId).then(p=>{if(active)setPage(p);}).catch(e=>{if(active)setError(String(e));});return()=>{active=false;};},[pageId]);
 useEffect(()=>{setLive({});},[JSON.stringify(properties),variantId]);
 const group=page?.trees.find(t=>t.id===groupId);
 const variants=useMemo(()=>group?(group.type==='COMPONENT_SET'?group.children??[]:[group]):[],[group]);
 if(error)return <div className="lab-error">{error}</div>;
 if(!group||!page)return <p className="lab-muted">Loading design system…</p>;
 const selected={...properties,...live};
 const node=variants.find(v=>variantId?v.id===variantId:Object.entries(selected).every(([k,value])=>!v.variantProperties?.[k]||v.variantProperties[k]===String(value)))??variants[0];
 const source=(id?:string)=>`https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id=${id?.replace(':','-')}`;
 const isButton=/^button$|download app button|button group/i.test(group.name);
 const isCheck=/checkbox|radiobutton|toggle/i.test(group.name);
 const editable=/input|search/i.test(group.name)&&!/upload|select|tag|autocomplete/i.test(group.name);
 const disabled=node.variantProperties?.State==='Disabled';
 const dark=node.variantProperties?.['Dark Mode']==='True';
 const toggle=()=>{if(isCheck&&group.children){const value=node.variantProperties?.Checked==='True'?'False':'True';setLive({...live,Checked:value});}};
 if(gallery){const filtered=variants.filter(v=>v.name.toLowerCase().includes(query.toLowerCase()));return <div><div className="lab-toolbar"><input aria-label="Filter variants" placeholder="Filter variants…" value={query} onChange={e=>setQuery(e.target.value)}/><span className="lab-muted">{filtered.length} / {variants.length} variants</span></div><div className="lab-variants">{filtered.map(v=><article className={`lab-variant ${v.variantProperties?.['Dark Mode']==='True'?'lab-dark':''}`} key={v.id}><span className="lab-variant-title">{v.name}</span><Scene node={v} imageMap={page.assets} label={group.name} disabled={v.variantProperties?.State==='Disabled'}/><a className="lab-source" href={source(v.id)} target="_blank" rel="noreferrer">View in Figma ↗</a></article>)}</div></div>;}
 return <div><div className={`lab-stage ${dark?'lab-dark':''}`} onClick={disabled?undefined:toggle} onPointerEnter={()=>{if(!properties.State||properties.State==='Default')setLive(s=>({...s,State:'Hover'}));}} onPointerLeave={()=>setLive(s=>{const next={...s};delete next.State;return next;})} onFocus={()=>{if(!properties.State||properties.State==='Default')setLive(s=>({...s,State:'Focused'}));}} onBlur={()=>setLive(s=>{const next={...s};delete next.State;return next;})}><Scene node={node} imageMap={page.assets} editable={editable} label={group.name} disabled={disabled} rootTag={isButton?'button':'div'}/>{isCheck&&<button type="button" onClick={e=>{e.stopPropagation();toggle();}} disabled={disabled} aria-pressed={node.variantProperties?.Checked==='True'} style={{marginTop:16}}>Toggle selection</button>}</div><a className="lab-source" href={source(node.id)} target="_blank" rel="noreferrer">{group.name} · View original in Figma ↗</a><p className="lab-meta">{node.name}</p></div>;
}
