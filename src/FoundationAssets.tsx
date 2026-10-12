import { useEffect, useState } from 'react';
import { loadPage, Scene } from './Scene';
import type { DesignPage } from './Scene';
export function FoundationAssets({pageId}:{pageId:string}){
 const [page,setPage]=useState<DesignPage>();const [query,setQuery]=useState('');const [offset,setOffset]=useState(0);const [error,setError]=useState('');
 useEffect(()=>{loadPage(pageId).then(setPage).catch(e=>setError(String(e)));},[pageId]);
 if(error)return <p className="lab-error">{error}</p>;if(!page)return <p>Loading assets…</p>;
 const nodes=page.trees.flatMap(n=>n.type==='COMPONENT_SET'?n.children??[]:[n]).filter(n=>n.name.toLowerCase().includes(query.toLowerCase()));
 return <main className="lab-catalog"><div className="lab-eyebrow">Foundations / Original assets</div><h1>{page.page.name.replace(/^↳\s*/,'')}</h1><div className="lab-toolbar"><input placeholder="Search by name…" aria-label="Search assets" value={query} onChange={e=>{setQuery(e.target.value);setOffset(0);}}/><span className="lab-muted">{nodes.length} assets</span><button onClick={()=>setOffset(Math.max(0,offset-96))} disabled={!offset}>Previous</button><button onClick={()=>setOffset(offset+96)} disabled={offset+96>=nodes.length}>Next</button><span className="lab-muted">{offset+1}–{Math.min(offset+96,nodes.length)}</span></div><div className="lab-grid">{nodes.slice(offset,offset+96).map(n=><article className="lab-panel" key={n.id}><div style={{height:120,overflow:'auto',display:'flex',alignItems:'center',justifyContent:'center'}}><Scene node={n} imageMap={page.assets}/></div><div className="lab-meta">{n.name}</div><a className="lab-source" target="_blank" rel="noreferrer" href={`https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id=${n.id?.replace(':','-')}`}>View original ↗</a></article>)}</div></main>;
}
