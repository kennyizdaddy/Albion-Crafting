(()=>{'use strict';
const root=document.getElementById('atlasCompoundRefining');if(!root)return;
// Refining subtab navigation: keep both calculators mounted and toggle visibility.
const standardTab=document.getElementById('atlasStandardTab');
const compoundTab=document.getElementById('atlasCompoundTab');
const standardPanel=document.getElementById('atlasStandardRefining');
if(standardTab&&compoundTab&&standardPanel){
  function selectRefiningTab(which){
    const compound=which==='compound';
    standardPanel.hidden=compound;
    root.hidden=!compound;
    standardTab.classList.toggle('active',!compound);
    compoundTab.classList.toggle('active',compound);
    standardTab.setAttribute('aria-selected',String(!compound));
    compoundTab.setAttribute('aria-selected',String(compound));
  }
  standardTab.addEventListener('click',()=>selectRefiningTab('standard'));
  compoundTab.addEventListener('click',()=>selectRefiningTab('compound'));
  selectRefiningTab('standard');
}

const recipes={'Metal Bar':{city:'Thetford',per:[0,0,1,2,2,3,4,5,5]},'Plank':{city:'Fort Sterling',per:[0,0,1,2,2,3,4,5,5]},'Cloth':{city:'Lymhurst',per:[0,0,1,2,2,3,4,5,5]},'Leather':{city:'Martlock',per:[0,0,1,2,2,3,4,5,5]},'Stone Block':{city:'Bridgewatch',per:[0,0,1,2,2,3,4,5,5]}};
const storage='albionAtlasCompoundSimpleV1';let saved={};try{saved=JSON.parse(localStorage.getItem(storage)||'{}')||{}}catch(e){}
const defaults={resource:'Metal Bar',tier:7,enchant:0,rate:36.71,mode:'backward',target:100,ores:{2:11,3:34,4:52,5:123,6:256,7:505,8:795}};
const state={...defaults,...saved,ores:{...defaults.ores,...(saved.ores||{})}};
const number=v=>Number.isFinite(+v)?Math.max(0,Math.floor(+v)):0;
const fmt=n=>Math.round(n).toLocaleString('en-US');
const safeRate=()=>Math.min(.999999,Math.max(0,(+state.rate||0)/100));
const yieldBars=(raw,per,rate)=>Math.floor(raw/(per*(1-rate))+1e-9);
const fromLower=(lower,rate)=>Math.floor(lower/(1-rate)+1e-9);
const needLower=(target,rate)=>Math.ceil(target*(1-rate)-1e-9);
function backward(){const r=safeRate(),top=number(state.tier),target=Math.max(1,number(state.target)),req={};let wanted=target;
for(let t=top;t>=2;t--){if(t===2){req[t]={tier:t,requiredBars:wanted,ore:Math.max(0,Math.ceil(wanted*(1-r)-1e-9))};}else{const lower=needLower(wanted,r);req[t]={tier:t,requiredBars:wanted,lowerNeeded:lower,ore:lower*recipes[state.resource].per[t]};wanted=lower;}}
let prev=0;const rows=[];for(let t=2;t<=top;t++){const q=req[t],bars=t===2?yieldBars(q.ore,1,r):Math.min(yieldBars(q.ore,recipes[state.resource].per[t],r),fromLower(prev,r));rows.push({...q,bars,previous:prev});prev=bars;}
return rows;}
function upward(){const r=safeRate(),top=number(state.tier);let prev=0;const rows=[];for(let t=2;t<=top;t++){const ore=number(state.ores[t]),per=recipes[state.resource].per[t],oreCapacity=yieldBars(ore,per,r),barCapacity=t===2?oreCapacity:Math.min(oreCapacity,fromLower(prev,r));rows.push({tier:t,ore,bars:barCapacity,previous:prev,oreCapacity});prev=barCapacity;}return rows;}
root.innerHTML=`<section class="panel"><h3>Compound Refining Setup</h3><p class="hint">Plan continual refining from T2 upward. Returned materials are assumed to be reused. This is an estimate based on the spreadsheet effective-consumption formula, not a simulation of individual returns.</p><div class="twocol"><label>Material<select id="cpSimpleResource">${Object.keys(recipes).map(x=>`<option>${x}</option>`).join('')}</select></label><label>Final tier<select id="cpSimpleTier">${[2,3,4,5,6,7,8].map(t=>`<option value="${t}">T${t}</option>`).join('')}</select></label></div><div class="twocol"><label>Enchantment<select id="cpSimpleEnchant">${[0,1,2,3,4].map(n=>`<option value="${n}">${n?' .'+n:'Unenchanted'}</option>`).join('')}</select></label><label>Resource return rate (%)<input id="cpSimpleRate" type="number" min="0" max="99.99" step="0.01"></label></div><p class="hint" id="cpSimpleCity"></p><div class="atlas-ref-tabs" role="tablist" aria-label="Compound calculation mode"><button type="button" id="cpBackward">Work Backwards</button><button type="button" id="cpUpward">Work Upwards</button></div><div id="cpSimpleControls"></div><div id="cpSimpleResults" aria-live="polite"></div></section>`;
const $=id=>document.getElementById(id);
function render(){ $('cpSimpleResource').value=state.resource;$('cpSimpleTier').value=state.tier;$('cpSimpleEnchant').value=state.enchant;$('cpSimpleRate').value=state.rate;
$('cpSimpleCity').textContent='Refining bonus city: '+recipes[state.resource].city+'. Set the effective return rate above; no additional focus or daily bonus is applied automatically.';
$('cpBackward').classList.toggle('active',state.mode==='backward');$('cpUpward').classList.toggle('active',state.mode==='upward');$('cpBackward').setAttribute('aria-selected',state.mode==='backward');$('cpUpward').setAttribute('aria-selected',state.mode==='upward');
const isBack=state.mode==='backward';$('cpSimpleControls').innerHTML=isBack?'<label>Desired final bars<input type="number" id="cpSimpleTarget" min="1" step="1" value="'+number(state.target)+'"></label>':'<p class="hint">Enter the raw ore you have at each tier. Each tier also uses the bars produced at the previous tier.</p><div class="twocol">'+Array.from({length:state.tier-1},(_,i)=>i+2).map(t=>'<label>T'+t+' raw resources<input type="number" min="0" step="1" data-ore-tier="'+t+'" value="'+number(state.ores[t])+'"></label>').join('')+'</div>';
const rows=isBack?backward():upward(),last=rows[rows.length-1],total=rows.reduce((n,x)=>n+x.ore,0);
$('cpSimpleResults').innerHTML='<h3 style="margin-top:1.5rem">'+(isBack?'Backward Refining Plan':'Upward Refining Estimate')+'</h3><div class="results"><div><small>Estimated final output</small><strong>'+fmt(last.bars)+' T'+state.tier+' '+state.resource+'</strong></div><div><small>Total raw ore across tiers</small><strong>'+fmt(total)+'</strong></div></div><div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;text-align:left"><thead><tr><th style="padding:10px">Tier</th><th style="padding:10px">'+(isBack?'Raw ore to buy':'Raw ore available')+'</th><th style="padding:10px">Previous-tier bars</th><th style="padding:10px">Expected bars</th></tr></thead><tbody>'+rows.map(x=>'<tr style="border-top:1px solid var(--border, #3b4655)"><td style="padding:10px">T'+x.tier+'</td><td style="padding:10px">'+fmt(x.ore)+'</td><td style="padding:10px">'+(x.tier===2?'—':fmt(x.previous))+'</td><td style="padding:10px"><strong>'+fmt(x.bars)+'</strong></td></tr>').join('')+'</tbody></table></div><p class="hint">'+(isBack?'This plan chooses the minimum previous-tier bar requirements at each step and rounds raw purchases up. Actual output can exceed the target because whole bars are carried forward.':'If a tier has insufficient ore or previous-tier bars, its output is limited and that limitation carries to higher tiers.')+'</p>';
try{localStorage.setItem(storage,JSON.stringify(state))}catch(e){}
}
for(const [id,field,parse] of [['cpSimpleResource','resource',String],['cpSimpleTier','tier',number],['cpSimpleEnchant','enchant',number],['cpSimpleRate','rate',Number]]){$(id).addEventListener('change',e=>{state[field]=parse(e.target.value);render()});}
$('cpBackward').addEventListener('click',()=>{state.mode='backward';render()});$('cpUpward').addEventListener('click',()=>{state.mode='upward';render()});
$('cpSimpleControls').addEventListener('input',e=>{if(e.target.id==='cpSimpleTarget')state.target=number(e.target.value);if(e.target.dataset.oreTier)state.ores[e.target.dataset.oreTier]=number(e.target.value);const pos=e.target.selectionStart;const id=e.target.id,tier=e.target.dataset.oreTier;render();const node=id?$(id):root.querySelector('[data-ore-tier="'+tier+'"]');if(node){node.focus();try{node.setSelectionRange(pos,pos)}catch(err){}}});
render();
window.albionAtlasCompoundCalculator={backward,upward,yieldBars,fromLower,needLower};
})();