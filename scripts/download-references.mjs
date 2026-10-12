import fs from 'node:fs';
for(const ref of JSON.parse(fs.readFileSync('design-source/qa-references.json','utf8'))){if(!ref.image_url)continue;const r=await fetch(ref.image_url);if(!r.ok)throw Error('Reference unavailable');fs.writeFileSync(`verification/figma-${ref.nodeId.replace(':','-')}.png`,Buffer.from(await r.arrayBuffer()));}
