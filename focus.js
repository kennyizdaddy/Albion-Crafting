(()=>{'use strict';
const $=id=>document.getElementById(id), KEY='albionAtlasFocusLevelsV1';
let settings={};try{settings=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
let current='';
const numeric=id=>{const s=$(id).value.trim();return s===''?null:Number(s)};
const valid=(n,max=Infinity)=>n!==null&&Number.isFinite(n)&&n>=0&&n<=max;
const ids=['focusMastery','focusSpec','focusRelated','focusFCE','focusGeneralCoeff','focusSpecCoeff','focusBase','focusManual'];
const stored=['focusMastery','focusSpec','focusRelated','focusFCE','focusGeneralCoeff','focusSpecCoeff'];
function key(){return [$('equipmentSelect').value,$('typeSelect').value,$('itemSelect').value].join('|')}
function family(){return [$('equipmentSelect').value,$('typeSelect').value].join(' / ')}
function load(){const next=key();if(!next||next===current)return;current=next;$('focusFamily').value=family();$('focusSpecialization').value=$('itemSelect').value;const state=settings[next]||{};for(const id of stored)$(id).value=state[id]??'';$('focusBase').value='';$('focusManual').value='';calculate()}
function save(){if(!current)return;const state={};for(const id of stored)state[id]=$(id).value;settings[current]=state;try{localStorage.setItem(KEY,JSON.stringify(settings))}catch(e){$('focusStatus').textContent='Could not save levels in this browser.'}}
function calculate(){const base=numeric('focusBase'),manual=numeric('focusManual'),mastery=numeric('focusMastery'),spec=numeric('focusSpec'),related=numeric('focusRelated'),fce=numeric('focusFCE'),gc=numeric('focusGeneralCoeff'),sc=numeric('focusSpecCoeff');const q=Math.max(1,Math.floor(Number($('craftQty').value)||1));let effective=null,per=null,reason='';
if(valid(fce)){effective=fce}else if(valid(mastery,100)&&valid(spec,120)&&valid(gc)&&valid(sc)){effective=mastery*gc+spec*sc+(valid(related)?related:0)}
if(valid(manual)){per=manual;reason='Manual focus per item override is active.'}else if(valid(base)&&effective!==null){per=Math.ceil(base*Math.pow(.5,effective/10000));reason='Estimated using base focus and Focus Cost Efficiency.'}else{reason='Enter manual focus per item, or enter verified base focus and total FCE (or both efficiency coefficients).'}
$('focusPerResult').textContent=per===null?'—':per.toLocaleString('en-US');$('focusTotalResult').textContent=per===null?'—':(per*q).toLocaleString('en-US');$('focusCapacityResult').textContent=per===null?'—':per===0?'Unlimited':Math.floor(10000/per).toLocaleString('en-US');$('focusEfficiencyResult').textContent=effective===null?'—':effective.toLocaleString('en-US');$('focusStatus').textContent=reason;
window.albionFocusBatch=()=>per===null?null:per*q;
}
for(const id of ids)$(id).addEventListener('input',()=>{if(stored.includes(id))save();calculate()});$('craftQty').addEventListener('input',calculate);
for(const id of ['equipmentSelect','typeSelect','itemSelect'])$(id).addEventListener('change',()=>setTimeout(load,0));
const observer=new MutationObserver(()=>{if(key()!==current&&$('itemSelect').value)load()});observer.observe($('itemSelect'),{childList:true});
load();
})();