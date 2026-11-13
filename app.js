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
 $('refRateNote').textContent='Automatic return rate: '+(r*100).toFixed(1)+'% · '+(bonus?city+' bonus':'Other royal city')+' · Focus '+(focus?'on':'off')+(daily?' · Daily +'+daily+'%':'')+'.';
 return r;
}
function fillSelect(id,values,selected){const el=$(id);el.replaceChildren();values.forEach(v=>{const o=document.createElement('option');o.value=o.textContent=v;el.append(o)});if(values.includes(selected))el.value=selected}
function updateTypes(){const category=$('equipmentSelect').value;const types=[...new Set(items.filter(x=>x.category===category).map(x=>x.subcategory))].sort();fillSelect('typeSelect',types,types.includes($('typeSelect').value)?$('typeSelect').value:types[0]);updateItems()}
function updateItems(){const category=$('equipmentSelect').value,type=$('typeSelect').value;const list=items.filter(x=>x.category===category&&x.subcategory===type);const old=$('itemSelect').value;fillSelect('itemSelect',list.map(x=>x.name).sort(),list.some(x=>x.name===old)?old:list[0]?.name);if(category==='Off-Hands')$('craftCity').value='Martlock';recipe()}
function recipe(){
 marketRequestSeq++;
 const item=items.find(x=>x.name===$('itemSelect').value);$('recipe').replaceChildren();$('itemCityNote').textContent=item?(item.bonusCity?'Preferred city for this item':'No crafting city bonus listed for this item'):'';$('craftBonusCity').textContent=item?(item.bonusCity||'Not specified'):'—';if(!item)return;
 for(const [i,m] of item.materials.entries()){
  const d=document.createElement('div');d.className='material';
  const isArtifact=!/^Tier \d+ (Plank|Bar|Cloth|Leather|Stone|Metal Bar)/i.test(m.name);
  const tier=$('craftTier').value,ench=$('enchant').value;
  const label=m.name.replace(/Tier 4/g,'Tier '+tier)+(isArtifact?'':'.'+ench);
  d.innerHTML=`<strong></strong><small></small><div class="twocol"><label>Buy price / unit<input type="number" min="0" step="any" placeholder="Required" class="buyprice"></label>${isArtifact?'':`<label>Self-refined cost / unit<input type="number" min="0" step="any" placeholder="Required for comparison" class="refprice"></label>`}</div>${isArtifact?'':`<label>Source<select class="source"><option value="buy">Buy</option><option value="refine">Refine</option></select></label>`}`;
  d.querySelector('strong').textContent=label;const qtyBadge=document.createElement('span');qtyBadge.className='material-quantity';d.insertBefore(qtyBadge,d.querySelector('small'));const meta=document.createElement('details');meta.className='material-details';const metaSummary=document.createElement('summary');metaSummary.textContent='Price details';meta.append(metaSummary);const stamp=document.createElement('span');stamp.className='market-stamp';stamp.textContent='Market price: not fetched';meta.append(stamp);const idLine=document.createElement('div');idLine.className='material-id';idLine.textContent='Market item ID: checking…';meta.append(idLine);d.append(meta);d.querySelector('small').textContent='Required per craft: '+m.qty+' · Total for '+Math.max(1,Math.floor(num('craftQty')||1))+' craft(s): '+(m.qty*Math.max(1,Math.floor(num('craftQty')||1)))+(isArtifact?' · no crafting resource return':'');
  qtyBadge.textContent=(m.qty*Math.max(1,Math.floor(num('craftQty')||1))).toLocaleString()+' required';d.dataset.materialName=m.name;d.dataset.qty=m.qty;d.dataset.artifact=isArtifact?'yes':'no';$('recipe').append(d)
 }
 $('recipe').querySelectorAll('input,select').forEach(el=>{el.addEventListener('input',craft);el.addEventListener('change',craft)});craft();
}
function craft(){
 const r=craftingRate(),q=Math.max(1,num('craftQty'));const currentItem=items.find(x=>x.name===$('itemSelect').value);if(currentItem){const match=!!currentItem.bonusCity&&currentItem.bonusCity===$('craftCity').value;const daily=$('craftDaily').value;const rates=craftingRates[daily]?.[match?'bonus':'other'];$('craftRateNoFocus').textContent=rates?(rates.No*100).toFixed(1)+'%':'—';$('craftRateWithFocus').textContent=rates?(rates.Yes*100).toFixed(1)+'%':'—';}
 for(const el of document.querySelectorAll('#recipe .material')){const per=Number(el.dataset.qty),count=Math.max(1,Math.floor(q));el.querySelector('small').textContent='Required per craft: '+per+' · Total for '+count+' craft(s): '+(per*count)+(el.dataset.artifact==='yes'?' · no crafting resource return':'');el.querySelector('.material-quantity').textContent=(per*count).toLocaleString()+' required';}
 const mats=[...document.querySelectorAll('.material')];
 const isUnsupported=r===null;
 const pct=num('craftTax')/100,fee=num('craftFee'),revenue=num('sellPrice')*q*(1-pct);
 const prices=el=>{const buy=el.querySelector('.buyprice').value,ref=el.querySelector('.refprice')?.value;return {buy:buy===''?null:Number(buy),ref:ref==null||ref===''?null:Number(ref)}};
 const sum=mode=>{
  let total=fee;
  for(const el of mats){const p=prices(el),artifact=el.dataset.artifact==='yes';const source=artifact?'buy':mode==='selected'?el.querySelector('.source').value:mode;
   const price=p[source];if(price===null||!Number.isFinite(price)||price<0)return null;
   total+=Number(el.dataset.qty)*q*price*(artifact?1:1-r);
  }return total;
 };
 const selected=sum('selected'),allBuy=sum('buy'),allRef=sum('ref');
 const missing=[];if(isUnsupported)missing.push('return rate unavailable — enter a manual override or choose a supported daily bonus');
 if(selected===null)missing.push('enter prices for every material under Recipe & prices (the selected Buy or Refine price for each)');
 if(mats.some(el=>el.dataset.artifact==='yes'&&/Weapon-specific|artifact/i.test(el.querySelector('strong').textContent)))missing.push('verify artifact recipe against in-game item');
 $('craftWarning').textContent=missing.length?'Crafting cost unavailable: '+missing.join('; ')+'.':(num('sellPrice')<=0?'Crafting cost calculated. Selling price is optional and only needed for profit.':'Crafting cost and profit calculated. Estimates use expected returns.');
 const show=(id,val,needsSale=false)=>$(id).textContent=val===null||isUnsupported||(needsSale&&num('sellPrice')<=0)?'—':silver(val);
 show('craftCost',selected);show('craftProfit',selected===null?null:revenue-selected,true);
 show('allBuyProfit',allBuy===null?null:revenue-allBuy,true);show('allRefProfit',allRef===null?null:revenue-allRef,true);
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
 const n=!valid?null:Math.max(0,Math.floor(Math.min(rawAvailable/(raw*(1-r)),tier===2?Infinity:prevAvailable/(prev*(1-r)))+1e-9));
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
   const input=el.querySelector('.buyprice');input.value=String(row.sell_price_min);input.dataset.marketValue=input.value;
   filled++;priceStamp(el,'Market: '+Number(row.sell_price_min).toLocaleString()+' silver · '+age+(hours>72?' · older data':''),hours>72);
  }
  for(const el of rows.filter(x=>!materialId(x)))priceStamp(el,'Manual price required (no verified market ID)',true);
  status.textContent='Applied '+filled+' price(s) from '+city+'. '+missing+' missing, '+stale+' too old. Prices remain editable.';
  craft();
 }catch(err){if(seq===marketRequestSeq)status.textContent='Market prices unavailable: '+err.message+'. You can still enter prices manually.'}
 finally{if(seq===marketRequestSeq)button.disabled=false}
}
$('fetchMarket').addEventListener('click',fetchMarketPrices);
$('marketCity').addEventListener('change',()=>{$('marketStatus').textContent='Market city changed. Fetch again to update prices; existing inputs are unchanged.'});

for(const id of ['resource','refTier','refEnchant','refRawAvailable'])$(id).addEventListener('input',autofillPreviousTier);
for(const id of ['craftQty','sellPrice','craftCity','craftFocus','craftDaily','craftRrr','craftFee','craftTax'])$(id).addEventListener('input',craft);for(const id of ['resource','refTier','refRawAvailable','refPrevAvailable','rawPrice','prevPrice','refSell','refFee','refFocus','refBonus','refDaily','refRrr'])$(id).addEventListener('input',refining);// Crafting item quick-search: uses the same loaded item catalog as the dependent dropdowns.
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
