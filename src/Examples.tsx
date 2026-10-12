import {useEffect,useState} from 'react';
import {loadPage,Scene} from './Scene';
import type {DesignPage} from './Scene';
export function Examples({pageId}:{pageId:string}){
const [page,setPage]=useState<DesignPage>();const [zoom,setZoom]=useState(.2);const [error,setError]=useState('');useEffect(()=>{loadPage(pageId).then(setPage).catch(e=>setError(String(e)));},[pageId]);
if(error)return <p className="lab-error">{error}</p>;if(!page)return <p>Loading examples…</p>;
return <main><div className="lab-toolbar"><label>Zoom <input type="range" style={{minWidth:180}} min="0.1" max="1" step="0.05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label><span className="lab-muted">{Math.round(zoom*100)}%</span></div>{page.trees.map(n=><section key={n.id}><h2>{n.name}</h2><a className="lab-source" href={`https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id=${n.id?.replace(':','-')}`} target="_blank" rel="noreferrer">View original examples ↗</a><div style={{overflow:'auto',maxWidth:'100%',maxHeight:1100,border:'1px solid #e5e5e5',borderRadius:12}}><div style={{width:n.width*zoom,height:n.height*zoom}}><div style={{width:n.width,height:n.height,transform:`scale(${zoom})`,transformOrigin:'0 0'}}><Scene node={n} imageMap={page.assets}/></div></div></div></section>)}</main>;
}
