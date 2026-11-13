// Automatic exact item-ID resolution using the public Albion item catalog.
// Ambiguous or missing names require manual verification; no guessed item IDs.
(()=>{
'use strict';
const get=id=>document.getElementById(id);
const api='https://west.albion-online-data.com/api/v2/stats/prices/';
const catalogUrls=[
 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json',
 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.txt'
];
let request=0,quote=null,catalogPromise=null,manual=false;
const money=n=>Math.round(n).toLocaleString()+' silver';
const stamp=s=>{if(!s||String(s).startsWith('0001-'))return NaN;return Date.parse(/[zZ]$|[+-]\d\d:\d\d$/.test(s)?s:s+'Z')};
const normalize=s=>String(s||'').toLowerCase().replace(/^(beginner.s|novice.s|journeyman.s|adept.s|expert.s|master.s|grandmaster.s|elder.s)\s+/,'').replace(/[^a-z0-9]/g,'');
const key=()=>[get('itemSelect').value,get('craftTier').value,get('enchant').value,get('craftCity').value,get('craftQuality').value,get('craftMarketItemId').value.trim()].join('|');
const status=s=>get('craftMarketStatus').textContent=s;
function update(){
 const qty=Math.max(1,Math.floor(Number(get('craftQty').value)||1));
 get('craftMarketValue').textContent=quote?money(quote.price*qty):'—';
 get('craftMarketUnit').textContent=quote?money(quote.price)+' / item':'—';
 get('craftMarketCity').textContent=get('craftCity').value;
 const sale=get('sellPrice');
 if(quote&&sale.dataset.marketAutofill==='yes'){sale.value=quote.price;if(typeof craft==='function')craft()}
}
function invalidate(message){request++;quote=null;status(message||'Selection changed. Fetch the latest sell order.');update()}
async function loadCatalog(){
 if(catalogPromise)return catalogPromise;
 catalogPromise=(async()=>{
  let error;
  for(const url of catalogUrls){
   try{
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
    let res;try{res=await fetch(url,{signal:controller.signal})}finally{clearTimeout(timer)}
    if(!res.ok)throw Error('Catalog HTTP '+res.status);
    const raw=await res.text();let rows;
    if(url.endsWith('.txt')){rows=raw.split(/\r?\n/).map(line=>{const [id,name]=line.split(': ');return {UniqueName:id,LocalizedNames:{'EN-US':name}}})}
    else{const parsed=JSON.parse(raw);rows=Array.isArray(parsed)?parsed:(parsed.items||[])}
    const index=new Map();
    for(const row of rows){
     const id=row.UniqueName||row.uniqueName||row.unique_name;
     const name=row.LocalizedNames?.['EN-US']||row.LocalizedNames?.['en-US']||row.localizedNames?.['EN-US']||row.localizedNames?.['en-US']||row.name;
     if(!id||!name||!/^T[4-8]_/.test(id))continue;
     const n=normalize(name);if(!index.has(n))index.set(n,new Set());index.get(n).add(id);
    }
    if(index.size<100)throw Error('Catalog missing equipment names');
    return index;
   }catch(e){error=e}
  }
  throw error||Error('Item catalog unavailable');
 })().catch(err=>{catalogPromise=null;throw err});
 return catalogPromise;
}
function matchId(index){
 const name=get('itemSelect').value,tier='T'+get('craftTier').value+'_',ench=Number(get('enchant').value);
 const ids=[...(index.get(normalize(name))||[])].filter(id=>id.startsWith(tier));
 // Albion IDs use @1-@4 for enchantments. Some exceptional variants use other suffixes.
 const exact=ids.filter(id=>ench?id.endsWith('@'+ench):!/@\d+$/.test(id));
 return [...new Set(exact)];
}
async function resolveId(){
 const seq=++request;
 if(manual&&get('craftMarketItemId').value.trim())return get('craftMarketItemId').value.trim().toUpperCase();
 status('Finding the exact Albion item ID…');
 try{
  const index=await loadCatalog();if(seq!==request)return null;
  const matches=matchId(index);
  if(matches.length===1){get('craftMarketItemId').value=matches[0];status('Item ID matched automatically: '+matches[0]);return matches[0]}
  get('craftMarketItemId').value='';
  status(matches.length?'Multiple item IDs match this name and tier. Enter the correct exact ID manually.':'No verified catalog match for this item, tier and enchantment. Enter its exact ID manually.');
  return null;
 }catch(e){if(seq===request)status('Automatic lookup unavailable ('+e.message+'). Enter the exact item ID manually.');return null}
}
async function fetchQuote(){
 const button=get('fetchCraftMarket');button.disabled=true;
 try{
  const id=await resolveId();if(!id)return;
  const city=get('craftCity').value,quality=Number(get('craftQuality').value),maxAge=Number(get('marketAge').value);
  if(city==='No Bonus'){invalidate('Select a real crafting city to fetch its market price.');return}
  if(!/^T[4-8]_[A-Z0-9_@-]+$/.test(id)){invalidate('Enter a valid exact Albion item ID.');return}
  const tier='T'+get('craftTier').value+'_';if(!id.startsWith(tier)){invalidate('The item ID must match selected tier '+tier);return}
  const enchant=Number(get('enchant').value);
  if(enchant>0&&!id.endsWith('@'+enchant)){invalidate('The ID must match enchantment @'+enchant);return}
  if(enchant===0&&/@\d+$/.test(id)){invalidate('The item ID is enchanted but .0 is selected.');return}
  const seq=++request,identity=key();status('Fetching lowest sell order in '+city+'…');quote=null;update();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  let res;try{res=await fetch(api+encodeURIComponent(id)+'.json?locations='+encodeURIComponent(city)+'&qualities='+quality,{signal:controller.signal})}finally{clearTimeout(timer)}
  if(!res.ok)throw Error('Market API HTTP '+res.status);
  const data=await res.json();if(!Array.isArray(data))throw Error('Invalid market response');
  if(seq!==request||identity!==key())return;
  const matches=data.filter(x=>x.item_id===id&&String(x.city).toLowerCase()===city.toLowerCase()&&Number(x.quality)===quality&&Number(x.sell_price_min)>0&&Number.isFinite(stamp(x.sell_price_min_date))).sort((a,b)=>stamp(b.sell_price_min_date)-stamp(a.sell_price_min_date));
  if(!matches.length){status('No reported sell order for this item, quality and city. Enter a selling price manually.');return}
  const rec=matches[0],hours=Math.max(0,(Date.now()-stamp(rec.sell_price_min_date))/3600000);
  if(maxAge>0&&hours>maxAge){status('Reported price '+money(rec.sell_price_min)+' is '+Math.round(hours)+'h old, beyond your freshness threshold. Not applied.');return}
  quote={price:Number(rec.sell_price_min),city,id,quality,date:rec.sell_price_min_date};
  status('Lowest reported sell order · '+city+' · '+rec.sell_price_min_date+' UTC · '+Math.round(hours)+'h old. Asking price, not guaranteed sale.');
  const sale=get('sellPrice');if(!sale.value||Number(sale.value)===0||sale.dataset.marketAutofill==='yes'){sale.dataset.marketAutofill='yes';sale.value=quote.price}
  update();if(typeof craft==='function')craft();
 }catch(err){status('Could not fetch market value: '+err.message+'. Enter a selling price manually.')}
 finally{button.disabled=false}
}
get('fetchCraftMarket').addEventListener('click',fetchQuote);
function selectionChanged(){manual=false;get('craftMarketItemId').value='';invalidate('Item changed. Looking up its Albion item ID…');if(get('itemSelect').value)resolveId()}
for(const id of ['itemSelect','craftTier','enchant'])get(id).addEventListener('change',selectionChanged);
for(const id of ['equipmentSelect','typeSelect'])get(id).addEventListener('change',()=>setTimeout(selectionChanged,0));
get('craftItemMatches')?.addEventListener('click',()=>setTimeout(selectionChanged,0));
setTimeout(()=>{if(get('itemSelect').value)resolveId()},800);
for(const id of ['craftCity','craftQuality','marketAge'])get(id).addEventListener('change',()=>invalidate('Selection changed. Fetch again for an updated market price.'));
get('craftMarketItemId').addEventListener('input',()=>{manual=!!get('craftMarketItemId').value.trim();invalidate('Manual item ID updated. Fetch again.')});
get('craftQty').addEventListener('input',update);
get('sellPrice').addEventListener('input',()=>{get('sellPrice').dataset.marketAutofill='no'});
window.albionCraftMarketSnapshot=()=>quote?{estimatedMarketUnit:quote.price,estimatedMarketTotal:quote.price*Math.max(1,Math.floor(Number(get('craftQty').value)||1)),marketCity:quote.city,marketItemId:quote.id,marketQuality:quote.quality,marketPriceDate:quote.date}:null;
update();
})();
