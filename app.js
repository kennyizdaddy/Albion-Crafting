const $=id=>document.getElementById(id);let items=[];const silver=n=>Number.isFinite(n)?Math.round(n).toLocaleString()+' silver':'—';const num=id=>Math.max(0,Number($(id).value)||0);const qty=[1,2,2,3,4,5,5];function route(){let page=location.hash.slice(1)||'home';if(!$(page)||!$(page).classList.contains('page'))page='home';document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==page);window.scrollTo(0,0)}window.addEventListener('hashchange',route);route();
// Rates copied from Crafting!Q7 in the November 2026 workbook.
const craftingRates={No:{bonus:{No:0.248,Yes:0.479},other:{No:0.152,Yes:0.435}},'Yes 10%':{bonus:{No:0.30,Yes:0.504},other:{No:0.218,Yes:0.465}}};
function craftingRate(){
 const custom=$('craftRrr').value;
 if(custom!==''){const v=Number(custom);if(!Number.isFinite(v)||v<0||v>=100){$('craftRateNote').textContent='Enter a manual rate between 0 and 99.9%.';return null} $('craftRateNote').textContent='Manual return-rate override: '+v+'%';return v/100}
 const item=items.find(x=>x.name===$('itemSelect').value),daily=$('craftDaily').value;
 if(daily==='Yes 20%'){$('craftRateNote').textContent='20% daily bonus rates have not been provided yet. Use a manual rate override if known.';return null}
 if(!item){$('craftRateNote').textContent='Choose an item.';return null}
 const city=item.bonusCity,selected=$('craftCity').value,match=Boolean(city)&&city===selected;
 const r=craftingRates[daily][match?'bonus':'other'][$('craftFocus').value];
 $('craftRateNote').textContent='Return rate: '+(r*100).toFixed(1)+'% · '+(match?'Bonus city':'Other city')+' · '+(city?'Item bonus city: '+city:'No bonus city listed in workbook');
 return r;
}
function refiningRate(){
 const custom=$('refRrr').value;
 if(custom!==''){const v=Number(custom);if(Number.isFinite(v)&&v>=0&&v<100){$('refRateNote').textContent='Manual refining return rate: '+v+'%';return v/100} $('refRateNote').textContent='Enter a valid rate from 0 to 99.9%.';return null}
 if($('refDaily').value!=='No'||$('refBonus').value==='Yes'){$('refRateNote').textContent='Refining city/daily bonus rate not supplied. Enter a manual override.';return null}
 const r=$('refFocus').value==='Yes'?0.539:0.367;
 $('refRateNote').textContent='Workbook settings baseline: '+(r*100).toFixed(1)+'%';return r;
}
function fillSelect(id,values,selected){const el=$(id);el.replaceChildren();values.forEach(v=>{const o=document.createElement('option');o.value=o.textContent=v;el.append(o)});if(values.includes(selected))el.value=selected}
function updateTypes(){const category=$('equipmentSelect').value;const types=[...new Set(items.filter(x=>x.category===category).map(x=>x.subcategory))].sort();fillSelect('typeSelect',types,types.includes($('typeSelect').value)?$('typeSelect').value:types[0]);updateItems()}
function updateItems(){const category=$('equipmentSelect').value,type=$('typeSelect').value;const list=items.filter(x=>x.category===category&&x.subcategory===type);const old=$('itemSelect').value;fillSelect('itemSelect',list.map(x=>x.name).sort(),list.some(x=>x.name===old)?old:list[0]?.name);recipe()}
function recipe(){
 marketRequestSeq++;
 const item=items.find(x=>x.name===$('itemSelect').value);$('recipe').replaceChildren();$('itemCityNote').textContent=item?'Workbook bonus city: '+(item.bonusCity||'Not specified'):'';if(!item)return;
 for(const [i,m] of item.materials.entries()){
  const d=document.createElement('div');d.className='material';
  const isArtifact=!/^Tier \d+ (Plank|Bar|Cloth|Leather|Stone|Metal Bar)/i.test(m.name);
  const tier=$('craftTier').value,ench=$('enchant').value;
  const label=m.name.replace(/Tier 4/g,'Tier '+tier)+(isArtifact?'':'.'+ench);
  d.innerHTML=`<strong></strong><small></small><div class="twocol"><label>Buy price / unit<input type="number" min="0" step="any" placeholder="Required" class="buyprice"></label>${isArtifact?'':`<label>Self-refined cost / unit<input type="number" min="0" step="any" placeholder="Required for comparison" class="refprice"></label>`}</div>${isArtifact?'':`<label>Source<select class="source"><option value="buy">Buy</option><option value="refine">Refine</option></select></label>`}`;
  d.querySelector('strong').textContent=label;const stamp=document.createElement('span');stamp.className='market-stamp';stamp.textContent='Market price: not fetched';d.append(stamp);d.querySelector('small').textContent='Required per craft: '+m.qty+(isArtifact?' · no crafting resource return':'');
  d.dataset.materialName=m.name;d.dataset.qty=m.qty;d.dataset.artifact=isArtifact?'yes':'no';$('recipe').append(d)
 }
 $('recipe').querySelectorAll('input,select').forEach(el=>{el.addEventListener('input',craft);el.addEventListener('change',craft)});craft();
}
function craft(){
 const r=craftingRate(),q=Math.max(1,num('craftQty'));
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
function refining(){let r=refiningRate(),tier=num('refTier'),raw=qty[tier-2],prev=tier===2?0:1,n=Math.max(1,num('refQty'));let total=n*(raw*num('rawPrice')+prev*num('prevPrice'))*(1-r)+num('refFee');let profit=n*num('refSell')*(1-.065)-total;$('refCost').textContent=r===null?'—':silver(total/n);$('refProfit').textContent=r===null?'—':silver(profit)}
function database(){let q=$('search').value.trim().toLowerCase();let matched=items.filter(i=>(i.name+' '+i.category+' '+i.subcategory+' '+i.bonusCity).toLowerCase().includes(q));$('itemCount').textContent=matched.length+' items';$('itemRows').replaceChildren();matched.slice(0,300).forEach(item=>{let tr=document.createElement('tr');[item.name,item.category+' / '+item.subcategory,item.bonusCity||'—',item.materials.map(m=>m.qty+' × '+m.name).join(', ')||'Recipe not provided'].forEach(v=>{let td=document.createElement('td');td.textContent=v;tr.append(td)});$('itemRows').append(tr)})}
// Americas (West) market prices. Never assume an unknown artifact ID is safe to map.
const MARKET_API='https://west.albion-online-data.com/api/v2/stats/prices/';
let marketRequestSeq=0;
const marketKinds={'Plank':'PLANKS','Bar':'METALBAR','Metal Bar':'METALBAR','Cloth':'CLOTH','Leather':'LEATHER','Stone Block':'STONEBLOCK'};
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
   if(!row||!Number.isFinite(stamp)){missing++;priceStamp(el,'No usable reported sell order in '+city,true);continue}
   const hours=Math.max(0,(now-stamp)/3600000),age=Math.round(hours)+'h old';
   if(maxAge>0&&hours>maxAge){stale++;priceStamp(el,'Stale: '+Number(row.sell_price_min).toLocaleString()+' silver · '+age+' (not applied)',true);continue}
   const input=el.querySelector('.buyprice');input.value=String(row.sell_price_min);input.dataset.marketValue=input.value;
   filled++;priceStamp(el,'Market: '+Number(row.sell_price_min).toLocaleString()+' silver · '+age+(hours>72?' · older data':''),hours>72);
  }
  for(const el of rows.filter(x=>!materialId(x)))priceStamp(el,'Manual price required (no verified market ID)',true);
  status.textContent='Applied '+filled+' price(s) from '+city+'. '+missing+' missing, '+stale+' too old. Prices remain editable.';
  craft();
 }catch(err){if(seq===marketRequestSeq)status.textContent='Market prices unavailable: '+err.message+'. You can still enter prices manually.'}
 finally{if(seq===marketRequestSeq)button.disabled=false}
}
// Six-city finished-equipment comparison. Exact item IDs come from the community item catalogue.
const ITEM_MARKET_CITIES=['Martlock','Fort Sterling','Thetford','Lymhurst','Bridgewatch','Caerleon'];
const ITEM_CATALOG_URL='https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json';
let itemCatalogPromise=null,itemPriceRequestSeq=0;
function selectedCraftedItem(){return items.find(x=>x.name===$('itemSelect').value)}
function itemMarketReset(){itemPriceRequestSeq++;$('itemMarketRows').innerHTML='<tr><td colspan="5">Choose Compare six cities to load prices for this selection.</td></tr>';$('itemMarketStatus').textContent='Item selection changed. Fetch again for the new item.'}
function normalizeItemName(name){return String(name||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9]+/g,' ').trim()}
function itemCatalogEntries(json){return Array.isArray(json)?json:(Array.isArray(json?.items)?json.items:[])}
async function getItemCatalog(){
 if(!itemCatalogPromise)itemCatalogPromise=(async()=>{
  const response=await fetch(ITEM_CATALOG_URL);if(!response.ok)throw new Error('Item catalogue HTTP '+response.status);
  const json=await response.json();const list=itemCatalogEntries(json);if(!list.length)throw new Error('Item catalogue format not recognized');return list;
 })().catch(err=>{itemCatalogPromise=null;throw err});
 return itemCatalogPromise;
}
function catalogEnglishName(entry){const names=entry.LocalizedNames||entry.localizedNames||{};return names['EN-US']||names['EN']||entry.name||entry.Name||''}
function catalogItemId(entry){return entry.UniqueName||entry.uniqueName||entry.item_id||entry.id||''}
// Albion catalogue names are often prefixed with the tier title (Adept's, Expert's, etc.).
// Compare the base item name, not the tier prefix or quality/enchantment suffix.
function canonicalEquipmentName(value){
 return normalizeItemName(String(value||'').replace(/^(?:Beginner's|Novice's|Journeyman's|Adept's|Expert's|Master's|Grandmaster's|Elder's)\s+/i,'').replace(/\s+of\s+quality\s+\w+$/i,''));
}
function isBaseEquipmentId(id){return /^T[2-8]_[A-Z0-9_]+$/.test(id)&&!id.includes('@')&&!/_LEVEL\d/.test(id)}
function applyTierAndEnchantment(base,tier,ench){
 if(!/^T[2-8]_/.test(base))return null;
 const id=base.replace(/^T[2-8]_/,`T${tier}_`).replace(/@\d+$/,'');
 return id+(ench?'@'+ench:'');
}
// Build a deterministic mapping for every name in items.json from the published item catalogue.
// Do not guess when names map to multiple distinct item IDs.
let itemIdMapPromise=null;
async function getItemIdMap(){
 if(!itemIdMapPromise)itemIdMapPromise=(async()=>{
  const catalog=await getItemCatalog();const byName=new Map();
  for(const entry of catalog){
   const id=catalogItemId(entry),name=canonicalEquipmentName(catalogEnglishName(entry));
   if(!isBaseEquipmentId(id)||!name)continue;
   const suffix=id.replace(/^T[2-8]_/,''),key=name;
   if(!byName.has(key))byName.set(key,new Set());byName.get(key).add(suffix);
  }
  const mapping=new Map(),ambiguous=new Map(),unmapped=[];
  for(const item of items){
   const key=canonicalEquipmentName(item.name),candidates=[...(byName.get(key)||[])];
   if(candidates.length===1)mapping.set(item.name,candidates[0]);
   else if(candidates.length>1)ambiguous.set(item.name,candidates);
   else unmapped.push(item.name);
  }
  return {mapping,ambiguous,unmapped,total:items.length};
 })().catch(err=>{itemIdMapPromise=null;throw err});
 return itemIdMapPromise;
}
async function resolveCraftedItemId(){
 const override=$('itemMarketId').value.trim();if(override){if(!/^[A-Za-z0-9_@-]+$/.test(override))throw new Error('Item ID override contains invalid characters');return {id:override,source:'manual item ID'}}
 const item=selectedCraftedItem();if(!item)throw new Error('Select an item first');
 const tier=Number($('craftTier').value),ench=Number($('enchant').value);
 const {mapping,ambiguous,unmapped,total}=await getItemIdMap();
 const suffix=mapping.get(item.name);
 if(!suffix){
  const detail=ambiguous.has(item.name)?'Multiple item IDs match this name.':'No reliable item ID found.';
  throw new Error(detail+' '+item.name+' needs a manual ID. '+mapping.size+' of '+total+' item names matched automatically.');
 }
 return {id:`T${tier}_${suffix}`+(ench?'@'+ench:''),source:'mapped item ID ('+mapping.size+'/'+total+' names)'};
}
function priceAge(iso){const time=parseMarketDate(iso);if(!Number.isFinite(time))return {label:'Unknown',hours:Infinity};const hours=Math.max(0,(Date.now()-time)/3600000);return {label:hours<48?Math.round(hours)+'h ago':Math.round(hours/24)+'d ago',hours}}
function validOrder(record,kind,maxHours){const value=Number(record[kind]);const date=priceAge(record[kind+'_date']);return value>0&&Number.isFinite(value)&&Number.isFinite(date.hours)&&(maxHours===0||date.hours<=maxHours)?{value,date}:null}
async function fetchItemMarketPrices(){
 const seq=++itemPriceRequestSeq,button=$('fetchItemMarket'),status=$('itemMarketStatus'),tbody=$('itemMarketRows');button.disabled=true;status.textContent='Looking up crafted item ID…';
 try{
  const {id,source}=await resolveCraftedItemId();if(seq!==itemPriceRequestSeq)return;
  const quality=Number($('itemQuality').value),maxAge=Number($('marketAge').value);
  status.textContent='Fetching '+id+' ('+source+') across six cities…';
  const url=MARKET_API+encodeURIComponent(id)+'.json?locations='+encodeURIComponent(ITEM_MARKET_CITIES.join(','))+'&qualities='+quality;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  let response;try{response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}})}finally{clearTimeout(timeout)}
  if(!response.ok)throw new Error(response.status===429?'API rate limit reached. Wait before retrying.':'Market API HTTP '+response.status);
  const records=await response.json();if(!Array.isArray(records))throw new Error('Unexpected market response');if(seq!==itemPriceRequestSeq)return;
  tbody.replaceChildren();let available=0;
  for(const city of ITEM_MARKET_CITIES){
   const row=records.find(x=>x.item_id===id&&String(x.city).toLowerCase()===city.toLowerCase()&&Number(x.quality)===quality);
   const sell=row?validOrder(row,'sell_price_min',maxAge):null,buy=row?validOrder(row,'buy_price_max',maxAge):null;
   const tr=document.createElement('tr'),tdCity=document.createElement('td');tdCity.textContent=city;tr.append(tdCity);
   for(const order of [sell,buy]){const td=document.createElement('td');td.textContent=order?order.value.toLocaleString()+' silver':'—';if(order)available++;tr.append(td)}
   const observed=document.createElement('td');observed.textContent=[sell&&'Sell '+sell.date.label,buy&&'Buy '+buy.date.label].filter(Boolean).join(' · ')||(row?'Missing / older than selected age':'No report');tr.append(observed);
   const action=document.createElement('td');for(const [label,order] of [['Sell',sell],['Buy',buy]])if(order){const b=document.createElement('button');b.type='button';b.className='price-use';b.textContent=label;b.title='Use '+city+' '+label.toLowerCase()+' order in profit calculation';b.addEventListener('click',()=>{$('sellPrice').value=String(order.value);craft();status.textContent='Using '+city+' '+label.toLowerCase()+' order: '+order.value.toLocaleString()+' silver per item. Confirm actual sale price in game.'});action.append(b)}if(!action.childNodes.length)action.textContent='—';tr.append(action);tbody.append(tr);
  }
  status.textContent=id+' · '+source+' · '+available+' usable price observations across six cities. Age limit: '+(maxAge?maxAge+'h':'any')+'.';
 }catch(err){if(seq===itemPriceRequestSeq){status.textContent='Could not compare prices: '+err.message;tbody.innerHTML='<tr><td colspan="5">No comparison available. Check item ID or try again later.</td></tr>'}}
 finally{if(seq===itemPriceRequestSeq)button.disabled=false}
}
$('fetchItemMarket').addEventListener('click',fetchItemMarketPrices);
for(const id of ['itemSelect','craftTier','enchant','itemQuality','itemMarketId'])$(id).addEventListener('change',itemMarketReset);
for(const id of ['equipmentSelect','typeSelect'])$(id).addEventListener('change',itemMarketReset);

$('fetchMarket').addEventListener('click',fetchMarketPrices);
$('marketCity').addEventListener('change',()=>{$('marketStatus').textContent='Market city changed. Fetch again to update prices; existing inputs are unchanged.'});

for(const id of ['craftQty','sellPrice','craftCity','craftFocus','craftDaily','craftRrr','craftFee','craftTax'])$(id).addEventListener('input',craft);for(const id of ['resource','refTier','refQty','rawPrice','prevPrice','refSell','refFee','refFocus','refBonus','refDaily','refRrr'])$(id).addEventListener('input',refining);$('equipmentSelect').addEventListener('change',updateTypes);$('typeSelect').addEventListener('change',updateItems);$('itemSelect').addEventListener('change',recipe);$('craftTier').addEventListener('change',recipe);$('enchant').addEventListener('change',recipe);$('search').addEventListener('input',database);fetch('items.json').then(r=>r.json()).then(data=>{items=data;fillSelect('equipmentSelect',['Boots','Chest','Helmets','Capes','Weapons'],'Boots');updateTypes();database()}).catch(()=>{$('recipe').textContent='Item database could not load. Open the site using a local server or GitHub Pages.'});refining();
