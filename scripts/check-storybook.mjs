import fs from 'node:fs';
import { chromium } from 'playwright';
fs.mkdirSync('verification',{recursive:true});
const base=process.env.STORYBOOK_URL??'http://127.0.0.1:6006';
const response=await fetch(base+'/index.json');if(!response.ok)throw Error('Story index failed');
const index=await response.json();const entries=Object.values(index.entries);
const targets=entries.filter(e=>['AllVariants','Screens','Catalog','Variables','Overview'].includes(e.exportName)||e.name==='Playground');
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const failures=[];const checks=[];let current='';
page.on('pageerror',error=>failures.push({story:current,error:String(error)}));
page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))failures.push({story:current,status:r.status(),url:r.url()});});
for(const story of targets){try{current=story.id;await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story`);if(['Variables','Overview'].includes(story.exportName)){await page.locator('.lab-catalog h1').first().waitFor();if(story.exportName==='Variables')await page.locator('.lab-token').first().waitFor();}else await page.locator('.lab-scene').first().waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);
 const missing=await page.locator('.lab-scene img').evaluateAll(nodes=>nodes.filter(n=>!n.complete||!n.naturalWidth).map(n=>n.src));
 if(missing.length){await page.waitForFunction(()=>[...document.querySelectorAll('.lab-scene img')].every(n=>n.complete&&n.naturalWidth),{timeout:15000}).catch(()=>{});}
 const result=await page.evaluate(()=>({scenes:document.querySelectorAll('.lab-scene').length,missing:[...document.querySelectorAll('.lab-scene img')].filter(n=>!n.complete||!n.naturalWidth).map(n=>n.src),width:document.querySelector('.lab-scene')?.getBoundingClientRect().width}));
 if(result.missing.length)failures.push({story:current,missing:result.missing});const expected=story.exportName==='AllVariants'?Number(story.name.match(/\((\d+)\)/)?.[1]):0;if(expected&&result.scenes!==expected)failures.push({story:current,expected,actual:result.scenes});checks.push({id:story.id,title:story.title,...result});
 await page.screenshot({path:`verification/${story.id}.png`});if(checks.length%25===0)console.log(JSON.stringify({checked:checks.length,total:targets.length}));
}catch(error){failures.push({story:story.id,error:String(error)});}
}
const buttons=entries.find(e=>e.title==='Components/Buttons/Button'&&e.name==='Playground');
await page.goto(`${base}/iframe.html?id=${buttons.id}&viewMode=story`);await page.locator('.lab-scene button').waitFor();
await page.locator('.lab-scene button').hover();const hover=await page.locator('.lab-scene button').evaluate(n=>getComputedStyle(n).backgroundColor);
await page.mouse.move(1200,900);await page.locator('.lab-scene button').focus();const focused=await page.locator('.lab-scene button').evaluate(n=>getComputedStyle(n).boxShadow);
const input=entries.find(e=>e.title==='Components/Input Fields/Default Input Field'&&e.name==='Playground');let editable=false;
if(input){await page.goto(`${base}/iframe.html?id=${input.id}&viewMode=story`);await page.locator('.lab-scene').waitFor();const field=page.locator('.lab-native-input').first();if(await field.count()){await field.fill('hello@layoutlab.test');editable=await field.inputValue()==='hello@layoutlab.test';}}
await page.goto(base+'/?path=/story/welcome--overview');await page.locator('#storybook-preview-iframe').waitFor();await page.screenshot({path:'verification/storybook-overview.png'});
await browser.close();
const report={stories:entries.length,groupsChecked:checks.length,checks,interaction:{hover,focused,editable},failures};fs.writeFileSync('verification/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({stories:entries.length,groupsChecked:checks.length,interaction:report.interaction,failures},null,2));if(failures.length||!editable)process.exitCode=1;
