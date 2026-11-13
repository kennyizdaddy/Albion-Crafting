const $=id=>document.getElementById(id);let items=[];const silver=n=>Number.isFinite(n)?Math.round(n).toLocaleString()+' silver':'—';const num=id=>Math.max(0,Number($(id).value)||0);const qty=[1,2,2,3,4,5,5];function route(){let page=location.hash.slice(1)||'home';if(!$(page)||!$(page).classList.contains('page'))page='home';document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==page);window.scrollTo(0,0)}window.addEventListener('hashchange',route);route();
// Rates copied from Crafting!Q7 in the November 2026 workbook.
const craftingRates={No:{bonus:{No:0.248,Yes:0.479},other:{No:0.152,Yes:0.435}},'Yes 10%':{bonus:{No:0.30,Yes:0.504},other:{No:0.218,Yes:0.465}},'Yes 20%':{bonus:{No:53/153,Yes:112/212},other:{No:38/138,Yes:97/197}}};
function craftingRate(){
 const custom=$('craftRrr').value;
 if(custom!==''){const v=Number(custom);if(!Number.isFinite(v)||v<0||v>=100){$('craftRateNote').textContent='Enter a manual rate between 0 and 99.9%.';return null} $('craftRateNote').textContent='Manual return-rate override: '+v+'%';return v/100}
 const item=items.find(x=>x.name===$('itemSelect').value),daily=$('craftDaily').value;
 if(!item){$('craftRateNote').textContent='Choose an item.';return null}
 const city=item.bonusCity,selected=$('craftCity').value,match=Boolean(city)&&city===selected;
 const r=craftingRates[daily][match?'bonus':'other'][$('craftFocus').value];
 $('craftRateNote').textContent='Return rate: '+(r*100).toFixed(1)+'% · '+(match?'Bonus city':'Other city')+' · '+(city?'Item bonus city: '+city:'No bonus city listed in workbook');
 return r;
}
const refiningCities={'Cloth':'Lymhurst','Leather':'Martlock','Metal Bar':'Thetford','Plank':'Fort Sterling','Stone Block':'Bridgewatch'};
function refiningRate(){
 const resource=$('resource').value,city=refiningCities[resource]||'Unknown';
 $('refCityNote').textContent='Refining bonus city: '+city+' · +40% production bonus when refining there.';
 const custom=$('refRrr').value;
 if(custom!==''){
  const v=Number(custom);
  if(Number.isFinite(v)&&v>=0&&v<100){$('refRateNote').textContent='Manual refining return rate: '+v.toFixed(1)+'% (overrides all automatic settings)';return v/100}
  $('refRateNote').textContent='Enter a valid rate from 0 to 99.9%.';return null;
 }
 const bonus=$('refBonus').value==='Yes',focus=$('refFocus').value==='Yes',daily=Number($('refDaily').value)||0;
 const productionBonus=18+(bonus?40:0)+(focus?59:0)+daily;
 const r=productionBonus/(100+productionBonus);
 $('refRateNote').textContent='Automatic return rate: '+(r*100).toFixed(2)+'% · '+(bonus?city+' bonus':'Other royal city')+' · Focus '+(focus?'on':'off')+(daily?' · Daily +'+daily+'%':'')+'.';
 return r;
}
function fillSelect(id,values,selected){const el=$(id);el.replaceChildren();values.forEach(v=>{const o=document.createElement('option');o.value=o.textContent=v;el.append(o)});if(values.includes(selected))el.value=selected}
function updateTypes(){const category=$('equipmentSelect').value;const types=[...new Set(items.filter(x=>x.category===category).map(x=>x.subcategory))].sort();fillSelect('typeSelect',types,types.includes($('typeSelect').value)?$('typeSelect').value:types[0]);updateItems()}
function updateItems(){const category=$('equipmentSelect').value,type=$('typeSelect').value;const list=items.filter(x=>x.category===category&&x.subcategory===type);const old=$('itemSelect').value;fillSelect('itemSelect',list.map(x=>x.name).sort(),list.some(x=>x.name===old)?old:list[0]?.name);if(category==='Off-Hands')$('craftCity').value='Martlock';recipe()}
const CRAFT_PRICE_KEY='albionAtlasMaterialPricesV1';
const materialPriceCache=new Map();
try{const data=JSON.parse(localStorage.getItem(CRAFT_PRICE_KEY)||'{}');if(data&&typeof data==='object')for(const [k,v] of Object.entries(data))if(v&&typeof v.value==='string')materialPriceCache.set(k,v)}catch(e){}
function materialKey(el){const id=materialId(el);if(id)return id;const item=items.find(x=>x.name===$('itemSelect').value);return 'artifact:'+String(item?.name||'')+':T'+$('craftTier').value+':'+(el.dataset.materialName||'')}
function rememberMaterial(el,source='manual'){const key=materialKey(el),value=el.querySelector('.buyprice').value;if(!key)return;if(value==='')materialPriceCache.delete(key);else materialPriceCache.set(key,{value,source,city:source==='market'?$('marketCity').value:null});try{localStorage.setItem(CRAFT_PRICE_KEY,JSON.stringify(Object.fromEntries(materialPriceCache)))}catch(e){$('marketStatus').textContent='Material prices could not be saved in browser storage.'}}
function restoreMaterial(el){const entry=materialPriceCache.get(materialKey(el));if(!entry)return;const input=el.querySelector('.buyprice');if(entry.source==='market'&&entry.city!==$('marketCity').value){priceStamp(el,'Saved market price belongs to '+entry.city+'; fetch again or enter a manual price.',true);return}input.value=entry.value;priceStamp(el,entry.source==='manual'?'Restored manually entered price':'Restored market price from '+entry.city)}
function positiveWhole(id){const raw=$(id).value.trim();const n=Number(raw);return raw!==''&&Number.isSafeInteger(n)&&n>0?n:null}
function feeRates(){const tax=Number($('craftTax').value),listing=Number($('craftListingFee').value);return $('craftTax').value!==''&&$('craftListingFee').value!==''&&Number.isFinite(tax)&&Number.isFinite(listing)&&(tax===4||tax===8)&&listing===2.5?{tax,listing}:null}
function recipe(){
 marketRequestSeq++;
 const item=items.find(x=>x.name===$('itemSelect').value);$('recipe').replaceChildren();$('itemCityNote').textContent=item?(item.bonusCity?'Preferred city for this item':'No crafting city bonus listed for this item'):'';$('craftBonusCity').textContent=item?(item.bonusCity||'Not specified'):'—';if(!item)return;
 for(const [i,m] of item.materials.entries()){
  const d=document.createElement('div');d.className='material';
  const isArtifact=!/^Tier \d+ (Plank|Bar|Cloth|Leather|Stone|Metal Bar)/i.test(m.name);
  const tier=$('craftTier').value,ench=$('enchant').value;
  const label=isArtifact?'T'+tier+' '+item.name+' Artifact':m.name.replace(/Tier 4/g,'Tier '+tier)+'.'+ench;
  d.innerHTML=`<strong></strong><small></small><label>Material buy price / unit<input type="number" min="0" step="any" placeholder="Required" class="buyprice"></label>`;
  d.querySelector('strong').textContent=label;const qtyBadge=document.createElement('span');qtyBadge.className='material-quantity';d.insertBefore(qtyBadge,d.querySelector('small'));const meta=document.createElement('details');meta.className='material-details';const metaSummary=document.createElement('summary');metaSummary.textContent='Price details';meta.append(metaSummary);const stamp=document.createElement('span');stamp.className='market-stamp';stamp.textContent='Market price: not fetched';meta.append(stamp);const idLine=document.createElement('div');idLine.className='material-id';idLine.textContent='Market item ID: checking…';meta.append(idLine);d.append(meta);d.querySelector('small').textContent='Required per craft: '+m.qty+' · Total for '+Math.max(1,Math.floor(num('craftQty')||1))+' craft(s): '+(m.qty*Math.max(1,Math.floor(num('craftQty')||1)))+(isArtifact?' · no crafting resource return':'');
  qtyBadge.textContent=(m.qty*Math.max(1,Math.floor(num('craftQty')||1))).toLocaleString()+' required';d.dataset.materialName=m.name;d.dataset.qty=m.qty;d.dataset.artifact=isArtifact?'yes':'no';$('recipe').append(d);restoreMaterial(d);d.querySelector('.buyprice').addEventListener('input',()=>rememberMaterial(d))
 }
 $('recipe').querySelectorAll('input,select').forEach(el=>{el.addEventListener('input',craft);el.addEventListener('change',craft)});craft();
}
function craft(){
 const r=craftingRate(),validQty=positiveWhole('craftQty'),q=validQty||0;const currentItem=items.find(x=>x.name===$('itemSelect').value);if(currentItem){const match=!!currentItem.bonusCity&&currentItem.bonusCity===$('craftCity').value;const daily=$('craftDaily').value;const rates=craftingRates[daily]?.[match?'bonus':'other'];$('craftRateNoFocus').textContent=rates?(rates.No*100).toFixed(1)+'%':'—';$('craftRateWithFocus').textContent=rates?(rates.Yes*100).toFixed(1)+'%':'—';}
 for(const el of document.querySelectorAll('#recipe .material')){const per=Number(el.dataset.qty),count=validQty||0;el.querySelector('small').textContent='Required per craft: '+per+' · Total for '+count+' craft(s): '+(per*count)+(el.dataset.artifact==='yes'?' · no crafting resource return':'');el.querySelector('.material-quantity').textContent=(per*count).toLocaleString()+' required';}
 const mats=[...document.querySelectorAll('.material')];
 const isUnsupported=r===null;
 const fees=feeRates(),fee=num('craftFee'),revenue=fees?num('sellPrice')*q*(1-(fees.tax+fees.listing)/100):null;
 let selected=fee;
 for(const el of mats){
  const value=el.querySelector('.buyprice').value;
  const price=value===''?null:Number(value);
  if(price===null||!Number.isFinite(price)||price<0){selected=null;break}
  const artifact=el.dataset.artifact==='yes';
  selected+=Number(el.dataset.qty)*q*price*(artifact?1:1-r);
 }
 const missing=[];if(!validQty)missing.push('quantity must be a positive whole number');if(!fees)missing.push('select 4% or 8% transaction tax; listing fee is fixed at 2.5%');if(isUnsupported)missing.push('return rate unavailable — enter a manual override or choose a supported daily bonus');
 if(selected===null)missing.push('enter a buy price for every required material');
 if(mats.some(el=>el.dataset.artifact==='yes'&&/Weapon-specific|artifact/i.test(el.querySelector('strong').textContent)))missing.push('verify artifact recipe against in-game item');
 $('craftWarning').textContent=missing.length?'Crafting cost unavailable: '+missing.join('; ')+'.':(num('sellPrice')<=0?'Crafting cost calculated. Selling price is optional and only needed for profit.':'Crafting cost and profit calculated. Estimates use expected returns.');
 if(!validQty||!fees)selected=null;const show=(id,val,needsSale=false)=>$(id).textContent=val===null||isUnsupported||(needsSale&&num('sellPrice')<=0)?'—':silver(val);
 show('craftCost',selected);show('craftUnitCost',selected===null?null:selected/q);show('craftProfit',selected===null?null:revenue-selected,true);renderFocusComparison(validQty,fees);
}
// Autofill the previous-tier input from the workbook recipe (Refining rows T3-T8):
// each refined unit consumes 1 previous-tier unit and 2/2/3/4/5/5 raw units.
// This is a starting inventory estimate, before applying resource returns.
function autofillPreviousTier(){
 const tier=num('refTier'),rawPer=qty[tier-2],previousPer=tier===2?0:1;
 const resource=$('resource').value;
 const enchant=Number($('refEnchant').value);
 const suffix=enchant?'.'+enchant:'';
 const names={
  'Cloth':{raw:'hemp',refined:'cloth'},
  'Leather':{raw:'hide',refined:'leather'},
  'Metal Bar':{raw:'ore',refined:'metal bar'},
  'Plank':{raw:'wood',refined:'plank'},
  'Stone Block':{raw:'stone',refined:'stone block'}
 };
 const item=names[resource]||{raw:'raw resource',refined:'refined resource'};
 const cap=x=>x.charAt(0).toUpperCase()+x.slice(1);
 $('refRecipeNote').textContent=tier===2
  ?`To refine 1 Tier 2${suffix} ${item.refined}, you need 1 Tier 2${suffix} ${item.raw}. (Before resource returns.)`
  :`To refine 1 Tier ${tier}${suffix} ${item.refined}, you need ${rawPer} Tier ${tier}${suffix} ${item.raw} and 1 Tier ${tier-1}${suffix} ${item.refined}. (Before resource returns.)`;
 const available=Number($('refRawAvailable').value);
 const next=tier===2?0:(Number.isFinite(available)&&available>=0?Math.floor(available*previousPer/rawPer):0);
 $('refPrevAvailable').value=String(next);
 refining();
}
function refining(){
 const r=refiningRate(),tier=num('refTier'),raw=qty[tier-2],prev=tier===2?0:1;
 const rawAvailable=Number($('refRawAvailable').value),prevAvailable=Number($('refPrevAvailable').value);
 $('refPrevAvailableWrap').hidden=tier===2;
 const valid=r!==null&&Number.isInteger(rawAvailable)&&rawAvailable>=0&&(tier===2||(Number.isInteger(prevAvailable)&&prevAvailable>=0));
 // Spreadsheet Refining!Q2: ROUNDDOWN(O2/(D2*(1-M2)),0)
 // Refining!Q3: ROUNDDOWN(MIN(O3/(D3*(1-M3)),P3/(I3*(1-M3))),0)
 const continual=$('refContinual').checked;
 const factor=continual?1-r:1;
 const n=!valid?null:Math.max(0,Math.floor(Math.min(rawAvailable/(raw*factor),tier===2?Infinity:prevAvailable/(prev*factor))+1e-9));
 const total=n===null?null:n*(raw*num('rawPrice')+prev*num('prevPrice'))*(1-r)+num('refFee');
 const profit=total===null?null:n*num('refSell')*(1-.065)-total;
 $('refEffective').textContent=n===null?'—':n.toLocaleString()+' units';
 $('refEffective').dataset.qty=n===null?'':String(n);
 $('refCost').textContent=n===null||n===0?'—':silver(total/n);
 $('refProfit').textContent=profit===null?'—':silver(profit);
 $('refCost').dataset.batchCost=n===null||n===0?'':String(total);
}
function database(){let q=$('search').value.trim().toLowerCase();let matched=items.filter(i=>(i.name+' '+i.category+' '+i.subcategory+' '+i.bonusCity).toLowerCase().includes(q));$('itemCount').textContent=matched.length+' items';$('itemRows').replaceChildren();matched.slice(0,300).forEach(item=>{let tr=document.createElement('tr');[item.name,item.category+' / '+item.subcategory,item.bonusCity||'—',item.materials.map(m=>m.qty+' × '+m.name).join(', ')||'Recipe not provided'].forEach(v=>{let td=document.createElement('td');td.textContent=v;tr.append(td)});$('itemRows').append(tr)})}
// Americas (West) market prices. Never assume an unknown artifact ID is safe to map.
const MARKET_API='https://west.albion-online-data.com/api/v2/stats/prices/';
let marketRequestSeq=0;
const marketKinds={'Plank':'PLANKS','Bar':'METALBAR','Metal Bar':'METALBAR','Cloth':'CLOTH','Leather':'LEATHER','Stone Block':'STONEBLOCK'};
// Resource ID conventions; artifacts have separate IDs and are not guessed.
const MATERIAL_ID_REFERENCE='https://github.com/ao-data/ao-bin-dumps';
function materialId(el){
 if(el.dataset.artifact==='yes')return null;
 const name=el.dataset.materialName||'';
 const match=name.match(/^Tier\s+\d+\s+(.+)$/i);
 if(!match)return null;
 const kind=marketKinds[match[1].trim()];if(!kind)return null;
 const tier=Number($('craftTier').value),ench=Number($('enchant').value);
 return 'T'+tier+'_'+kind+(ench?'_LEVEL'+ench+'@'+ench:'');
}
function priceStamp(el,msg,warn=false){const s=el.querySelector('.market-stamp');if(s){s.textContent=msg;s.className='market-stamp '+(warn?'warn':'ok')}}
function parseMarketDate(s){if(!s||String(s).startsWith('0001-'))return NaN;const d=Date.parse(s.endsWith('Z')||/[+-]\d\d:\d\d$/.test(s)?s:s+'Z');return d;}
async function fetchMarketPrices(){
 const button=$('fetchMarket'),status=$('marketStatus'),city=$('marketCity').value;
 const rows=[...document.querySelectorAll('#recipe .material')],known=rows.map(el=>({el,id:materialId(el)})).filter(x=>x.id);
 const seq=++marketRequestSeq;
 if(!known.length){status.textContent='No recognized tradeable resources in this recipe. Enter prices manually.';return}
 for(const el of rows){const id=materialId(el);el.querySelector('.material-id').textContent=id?'Market item ID: '+id+' · generated from resource type / tier / enchantment':'Market item ID: not verified (artifact / special ingredient)';}
 const ids=[...new Set(known.map(x=>x.id))];button.disabled=true;status.textContent='Fetching '+ids.length+' material price(s) from '+city+'…';
 try{
  const url=MARKET_API+ids.map(encodeURIComponent).join(',')+'.json?locations='+encodeURIComponent(city)+'&qualities=1';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
  let response;try{response=await fetch(url,{signal:controller.signal,headers:{'Accept':'application/json'}})}finally{clearTimeout(timeout)}
  if(!response.ok)throw new Error(response.status===429?'Rate limit reached. Wait before trying again.':'Market API HTTP '+response.status);
  const records=await response.json();if(!Array.isArray(records))throw new Error('Unexpected market API response');
  if(seq!==marketRequestSeq)return;
  let filled=0,missing=0,stale=0;const maxAge=Number($('marketAge').value),now=Date.now();
  for(const {el,id} of known){
   const matches=records.filter(x=>x.item_id===id&&String(x.city).toLowerCase()===city.toLowerCase()&&Number(x.quality)===1&&Number(x.sell_price_min)>0);
   matches.sort((a,b)=>parseMarketDate(b.sell_price_min_date)-parseMarketDate(a.sell_price_min_date));
   const row=matches[0],stamp=row?parseMarketDate(row.sell_price_min_date):NaN;
   if(!row||!Number.isFinite(stamp)){missing++;const all=records.filter(x=>x.item_id===id&&String(x.city).toLowerCase()===city.toLowerCase()&&Number(x.quality)===1);const hasBuy=all.some(x=>Number(x.buy_price_max)>0);priceStamp(el,'No API sell observation for '+id+' in '+city+(hasBuy?' · buy orders exist, but are not purchase prices':''),true);continue}
   const hours=Math.max(0,(now-stamp)/3600000),age=Math.round(hours)+'h old';
   if(maxAge>0&&hours>maxAge){stale++;priceStamp(el,'Older reported price: '+Number(row.sell_price_min).toLocaleString()+' silver · '+age+' · '+row.sell_price_min_date+' UTC (not auto-applied; choose Any age to use)',true);continue}
   const input=el.querySelector('.buyprice');input.value=String(row.sell_price_min);input.dataset.marketValue=input.value;rememberMaterial(el,'market');
   filled++;priceStamp(el,'Market: '+Number(row.sell_price_min).toLocaleString()+' silver · '+age+(hours>72?' · older data':''),hours>72);
  }
  for(const el of rows.filter(x=>!materialId(x)))priceStamp(el,'Manual price required (no verified market ID)',true);
  status.textContent='Applied '+filled+' price(s) from '+city+'. '+missing+' missing, '+stale+' too old. Prices remain editable.';
  craft();
 }catch(err){if(seq===marketRequestSeq)status.textContent='Market prices unavailable: '+err.message+'. You can still enter prices manually.'}
 finally{if(seq===marketRequestSeq)button.disabled=false}
}
function renderFocusComparison(q,fees){
 const ids=['compareNoCost','compareYesCost','compareNoProfit','compareYesProfit','compareSavings','comparePerFocus'];for(const id of ids)$(id).textContent='—';
 if(!q||!fees)return;const item=items.find(x=>x.name===$('itemSelect').value);if(!item)return;
 const daily=$('craftDaily').value,match=!!item.bonusCity&&item.bonusCity===$('craftCity').value;
 const rates=craftingRates[daily]?.[match?'bonus':'other'];if(!rates)return;
 let no=num('craftFee'),yes=no;
 for(const el of document.querySelectorAll('#recipe .material')){const input=el.querySelector('.buyprice');if(input.value===''||!Number.isFinite(Number(input.value))||Number(input.value)<0)return;const base=Number(el.dataset.qty)*q*Number(input.value);no+=base*(el.dataset.artifact==='yes'?1:1-rates.No);yes+=base*(el.dataset.artifact==='yes'?1:1-rates.Yes)}
 $('compareNoCost').textContent=silver(no);$('compareNoCost').dataset.rawCost=String(no);$('compareYesCost').textContent=silver(yes);const saved=no-yes;$('compareSavings').textContent=silver(saved);
 if(num('sellPrice')>0){const net=num('sellPrice')*q*(1-(fees.tax+fees.listing)/100);$('compareNoProfit').textContent=silver(net-no);$('compareYesProfit').textContent=silver(net-yes)}
 const f=$('craftFocusAmount').value.trim(),points=Number(f);if(f!==''&&Number.isFinite(points)&&points>0)$('comparePerFocus').textContent=(saved/points).toLocaleString('en-US',{maximumFractionDigits:2})+' silver/focus';
 $('compareNote').textContent=$('craftRrr').value!==''?'Comparison uses automatic no-focus/focus rates; your manual return-rate override applies only to the main estimate.':'Same materials, city, station cost, and sales fees for both scenarios.';
}
const CRAFT_FEE_KEY='albionAtlasJournalFeePreferencesV1';
function loadCraftFees(){let tax=4;try{const pref=JSON.parse(localStorage.getItem(CRAFT_FEE_KEY)||'{}');if(pref.tax===8)tax=8}catch(e){}$('craftTax').value=String(tax);$('craftListingFee').value='2.5'}
loadCraftFees();
$('craftSaveFees').addEventListener('click',()=>{const fees=feeRates();if(!fees){$('craftFeeStatus').textContent='Choose 4% or 8% transaction tax; listing fee is fixed at 2.5%.';return}try{localStorage.setItem(CRAFT_FEE_KEY,JSON.stringify(fees));$('jSaleFee').value=fees.tax;$('jListingFee').value=fees.listing;$('craftFeeStatus').textContent='Defaults saved for Crafting and Journal.'}catch(e){$('craftFeeStatus').textContent='Unable to save default fees.'}});
const PRESET_KEY='albionAtlasCraftPresetsV1';let craftPresets=[];try{const data=JSON.parse(localStorage.getItem(PRESET_KEY)||'[]');if(Array.isArray(data))craftPresets=data.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&typeof x.item==='string').slice(0,200)}catch(e){}
function renderPresets(selected=''){const select=$('craftPresetSelect');select.replaceChildren(new Option('Select a saved preset',''));for(const p of craftPresets)select.add(new Option(p.name,p.id));select.value=selected}
function presetSnapshot(){const item=items.find(x=>x.name===$('itemSelect').value);if(!item||!positiveWhole('craftQty'))return null;return {item:item.name,tier:$('craftTier').value,enchant:$('enchant').value,city:$('craftCity').value,focus:$('craftFocus').value,focusAmount:$('craftFocusAmount').value,daily:$('craftDaily').value,rrr:$('craftRrr').value,qty:$('craftQty').value}}
function persistPresets(){try{localStorage.setItem(PRESET_KEY,JSON.stringify(craftPresets));return true}catch(e){$('craftPresetStatus').textContent='Browser storage unavailable; preset not saved.';return false}}
$('craftPresetSave').addEventListener('click',()=>{const snapshot=presetSnapshot(),name=$('craftPresetName').value.trim();if(!snapshot||!name){$('craftPresetStatus').textContent='Choose an item, valid whole-number quantity, and preset name.';return}const id=String(Date.now())+'-'+Math.random().toString(36).slice(2);craftPresets.push({...snapshot,id,name});if(!persistPresets()){craftPresets.pop();return}renderPresets(id);$('craftPresetStatus').textContent='Preset saved.'});
$('craftPresetUpdate').addEventListener('click',()=>{const id=$('craftPresetSelect').value,snapshot=presetSnapshot(),index=craftPresets.findIndex(x=>x.id===id);if(index<0||!snapshot){$('craftPresetStatus').textContent='Select a preset and enter valid crafting settings.';return}const old=craftPresets[index];craftPresets[index]={...old,...snapshot,name:$('craftPresetName').value.trim()||old.name};if(!persistPresets()){craftPresets[index]=old;return}renderPresets(id);$('craftPresetStatus').textContent='Preset updated.'});
$('craftPresetLoad').addEventListener('click',()=>{const preset=craftPresets.find(x=>x.id===$('craftPresetSelect').value),item=items.find(x=>x.name===preset?.item);if(!item){$('craftPresetStatus').textContent='Preset item is unavailable in the current catalog.';return}fillSelect('equipmentSelect',[...new Set(items.map(x=>x.category))].sort(),item.category);updateTypes();$('typeSelect').value=item.subcategory;updateItems();$('itemSelect').value=item.name;for(const [id,key] of [['craftTier','tier'],['enchant','enchant'],['craftCity','city'],['craftFocus','focus'],['craftFocusAmount','focusAmount'],['craftDaily','daily'],['craftRrr','rrr'],['craftQty','qty']])$(id).value=preset[key]??'';$('craftItemSearch').value=item.name;$('craftPresetName').value=preset.name;recipe();$('craftFocus').dispatchEvent(new Event('input',{bubbles:true}));$('craftPresetStatus').textContent='Preset loaded; no Journal entry created.'});
$('craftPresetDelete').addEventListener('click',()=>{const id=$('craftPresetSelect').value;if(!id||!confirm('Delete this crafting preset?'))return;const old=craftPresets;craftPresets=old.filter(x=>x.id!==id);if(!persistPresets()){craftPresets=old;return}renderPresets();$('craftPresetStatus').textContent='Preset deleted.'});
$('craftPresetSelect').addEventListener('change',()=>{const p=craftPresets.find(x=>x.id===$('craftPresetSelect').value);if(p)$('craftPresetName').value=p.name});renderPresets();
$('fetchMarket').addEventListener('click',fetchMarketPrices);
$('marketCity').addEventListener('change',()=>{$('marketStatus').textContent='Market city changed. Fetch again to update prices; existing inputs are unchanged.'});

for(const id of ['resource','refTier','refEnchant','refRawAvailable'])$(id).addEventListener('input',autofillPreviousTier);
for(const id of ['craftQty','sellPrice','craftCity','craftFocus','craftDaily','craftRrr','craftFee','craftTax','craftListingFee','craftFocusAmount'])$(id).addEventListener('input',craft);for(const id of ['resource','refTier','refRawAvailable','refPrevAvailable','rawPrice','prevPrice','refSell','refFee','refFocus','refBonus','refDaily','refRrr','refContinual'])$(id).addEventListener('input',refining);// Crafting item quick-search: uses the same loaded item catalog as the dependent dropdowns.
function setupCraftItemSearch(){
 const input=$('craftItemSearch'), panel=$('craftItemMatches');
 const close=()=>{panel.hidden=true;input.setAttribute('aria-expanded','false')};
 const choose=item=>{
   fillSelect('equipmentSelect',[...new Set(items.map(x=>x.category))].sort(),item.category);
   updateTypes();
   $('typeSelect').value=item.subcategory;
   updateItems();
   $('itemSelect').value=item.name;
   recipe();
   input.value=item.name;
   close();
 };
 const render=()=>{
   const q=input.value.trim().toLocaleLowerCase();panel.replaceChildren();
   if(!q){close();return}
   const matches=items.filter(x=>x.name.toLocaleLowerCase().includes(q)).sort((a,b)=>
     Number(!a.name.toLocaleLowerCase().startsWith(q))-Number(!b.name.toLocaleLowerCase().startsWith(q)) || a.name.localeCompare(b.name)).slice(0,12);
   if(!matches.length){const empty=document.createElement('div');empty.className='item-search-empty';empty.textContent='No matching items';panel.append(empty)}
   for(const item of matches){const b=document.createElement('button');b.type='button';b.className='item-search-choice';b.setAttribute('role','option');b.textContent=item.name+' · '+item.subcategory;b.addEventListener('click',()=>choose(item));panel.append(b)}
   panel.hidden=false;input.setAttribute('aria-expanded','true');
 };
 input.addEventListener('input',render);
 input.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Enter'&&!panel.hidden){const first=panel.querySelector('button');if(first){e.preventDefault();first.click()}}});
 document.addEventListener('click',e=>{if(!e.target.closest('.item-quick-search'))close()});
 for(const id of ['equipmentSelect','typeSelect','itemSelect'])$(id).addEventListener('change',()=>{input.value='';close()});
}
setupCraftItemSearch();
$('equipmentSelect').addEventListener('change',updateTypes);$('typeSelect').addEventListener('change',updateItems);$('itemSelect').addEventListener('change',recipe);$('craftTier').addEventListener('change',recipe);$('enchant').addEventListener('change',recipe);$('search').addEventListener('input',database);fetch('items.json').then(r=>r.json()).then(data=>{items=data;fillSelect('equipmentSelect',['Boots','Chest','Helmets','Capes','Weapons','Off-Hands'],'Boots');updateTypes();database()}).catch(()=>{$('recipe').textContent='Item database could not load. Open the site using a local server or GitHub Pages.'});autofillPreviousTier();
