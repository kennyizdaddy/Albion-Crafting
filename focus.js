(()=>{'use strict';
const $=id=>document.getElementById(id), KEY='albionAtlasFocusLevelsV1';
let settings={};try{settings=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
let current='';
const numeric=id=>{const s=$(id).value.trim();return s===''?null:Number(s)};
const valid=(n,max=Infinity)=>n!==null&&Number.isFinite(n)&&n>=0&&n<=max;
const ids=['focusMastery','focusSpec','focusRelated','focusFCE','focusGeneralCoeff','focusSpecCoeff','focusBase','focusManual'];
const stored=['focusMastery','focusSpec','focusRelated','focusFCE','focusGeneralCoeff','focusSpecCoeff'];
const data=window.ALBION_NODE_DATA;
const nodes=$('focusNode'),item=$('focusItem');
const exact={4:{8:429,16:858,24:1286,32:1715},5:{8:750,16:1501,32:3001},6:{8:1313,16:2626,32:5252},7:{8:2298,16:4596,32:9191},8:{8:4021,16:8042,32:16085}};
function available(){const node=data.nodes.find(n=>n.name===nodes.value);if(!node)return [];const family=node.name.replace(/ Crafter$/,'');return data.items.filter(x=>{if(x.category!==node.category)return false;if(node.category==='Weapons')return x.family===family;const f=family.toLowerCase(),name=x.name.toLowerCase();if(node.category==='Chest')return f.startsWith('Cloth')?(/robe|garb|jacket|armor/.test(name)&&x.family==='Cloth'):f.startsWith('Leather')?x.family==='Leather':x.family==='Plate';return x.family===(f.startsWith('Cloth')?'Cloth':f.startsWith('Leather')?'Leather':'Plate')})}
function setItems(){const old=item.value;item.replaceChildren();for(const x of available()){const o=document.createElement('option');o.value=x.name;o.textContent=x.name;item.append(o)}if([...item.options].some(o=>o.value===old))item.value=old;load()}
function key(){return nodes.value+'|'+item.value}
function family(){return nodes.value}
function autoBase(){const x=available().find(x=>x.name===item.value);const tier=Number($('focusTier').value),ench=Number($('focusEnchant').value);let value=null,source='';if(x&&ench===0&&exact[tier]?.[x.resources]!==undefined){value=exact[tier][x.resources];source='Reference base focus: '+value.toLocaleString()+' for T'+tier+'.0 equipment using '+x.resources+' resources. Based on previously gathered values; verify in game.'}else if(ench!==0){source='Enchanted focus values are not yet verified. Enter base focus manually or use actual focus override.'}else{source='No verified base focus for this recipe and tier. Enter base focus manually or use actual focus override.'}return {value,source}}
function refreshBase(){const v=autoBase();$('focusBase').value=v.value??'';$('focusBaseSource').textContent=v.source;calculate()}
function load(){const next=key();if(!item.value||next===current)return;current=next;$('focusFamily').value=family();$('focusSpecialization').value=item.value;const state=settings[next]||{};for(const id of stored)$(id).value=state[id]??'';$('focusManual').value='';refreshBase()}
function save(){if(!current)return;const state={};for(const id of stored)state[id]=$(id).value;settings[current]=state;try{localStorage.setItem(KEY,JSON.stringify(settings))}catch(e){$('focusStatus').textContent='Could not save levels in this browser.'}}
function calculate(){const base=numeric('focusBase'),manual=numeric('focusManual'),mastery=numeric('focusMastery'),spec=numeric('focusSpec'),related=numeric('focusRelated'),fce=numeric('focusFCE'),gc=numeric('focusGeneralCoeff'),sc=numeric('focusSpecCoeff');const q=Math.max(1,Math.floor(Number($('craftQty').value)||1));let effective=null,per=null,reason='';
if(valid(fce)){effective=fce}else if(valid(mastery,100)&&valid(spec,120)&&valid(gc)&&valid(sc)){effective=mastery*gc+spec*sc+(valid(related)?related:0)}
if(valid(manual)){per=manual;reason='Manual focus per item override is active.'}else if(valid(base)&&effective!==null){per=Math.ceil(base*Math.pow(.5,effective/10000));reason='Estimated using base focus and Focus Cost Efficiency.'}else{reason='Enter manual focus per item, or enter verified base focus and total FCE (or both efficiency coefficients).'}
$('focusPerResult').textContent=per===null?'—':per.toLocaleString('en-US');$('focusTotalResult').textContent=per===null?'—':(per*q).toLocaleString('en-US');$('focusCapacityResult').textContent=per===null?'—':per===0?'Unlimited':Math.floor(10000/per).toLocaleString('en-US');$('focusEfficiencyResult').textContent=effective===null?'—':effective.toLocaleString('en-US');$('focusStatus').textContent=reason;
window.albionFocusBatch=()=>per===null?null:per*q;
}
for(const n of data.nodes){const o=document.createElement('option');o.value=n.name;o.textContent=n.name;nodes.append(o)}
for(const id of ids)$(id).addEventListener('input',()=>{if(stored.includes(id))save();calculate()});
$('craftQty').addEventListener('input',calculate);
nodes.addEventListener('change',setItems);item.addEventListener('change',load);
for(const id of ['focusTier','focusEnchant'])$(id).addEventListener('change',refreshBase);
setItems();
})();// Focus calculator
