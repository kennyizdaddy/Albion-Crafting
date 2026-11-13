// Crafting city market valuation. Exact Albion item IDs can be entered manually;
// guessing IDs from display names is deliberately avoided.
(()=>{
'use strict';
const get=id=>document.getElementById(id);
const api='https://west.albion-online-data.com/api/v2/stats/prices/';
let request=0,quote=null;
const money=n=>Math.round(n).toLocaleString()+' silver';
const stamp=s=>{if(!s||String(s).startsWith('0001-'))return NaN;return Date.parse(/[zZ]$|[+-]\d\d:\d\d$/.test(s)?s:s+'Z')};
const key=()=>[get('itemSelect').value,get('craftTier').value,get('enchant').value,get('craftCity').value,get('craftQuality').value,get('craftMarketItemId').value.trim()].join('|');
function update(){
 const qty=Math.max(1,Math.floor(Number(get('craftQty').value)||1));
 get('craftMarketValue').textContent=quote?money(quote.price*qty):'—';
 get('craftMarketUnit').textContent=quote?money(quote.price)+' / item':'—';
 get('craftMarketCity').textContent=get('craftCity').value;
 const sale=get('sellPrice');
 if(quote&&sale.dataset.marketAutofill==='yes'){
   sale.value=quote.price;
   if(typeof craft==='function')craft();
 }
}
function invalidate(message){request++;quote=null;get('craftMarketStatus').textContent=message||'Fetch the latest sell order for this item.';update();}
async function fetchQuote(){
 const city=get('craftCity').value,id=get('craftMarketItemId').value.trim().toUpperCase(),quality=Number(get('craftQuality').value),maxAge=Number(get('marketAge').value);
 if(city==='No Bonus'){invalidate('Select a real crafting city to fetch its market price.');return}
 if(!/^T[4-8]_[A-Z0-9_@-]+$/.test(id)){invalidate('Enter a valid exact Albion item ID (for example T4_MAIN_SWORD).');return}
 const tier='T'+get('craftTier').value+'_';
 if(!id.startsWith(tier)){invalidate('The item ID must match the selected tier ('+tier+').');return}
 const enchant=Number(get('enchant').value);
 if(enchant>0&&!id.endsWith('@'+enchant)){invalidate('Enchanted item IDs should end in @'+enchant+'. Verify the exact item ID.');return}
 if(enchant===0&&/@\d+$/.test(id)){invalidate('The item ID appears enchanted, but .0 is selected.');return}
 const seq=++request,identity=key(),button=get('fetchCraftMarket');
 button.disabled=true;get('craftMarketStatus').textContent='Fetching lowest sell order in '+city+'…';quote=null;update();
 try{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  let res;try{res=await fetch(api+encodeURIComponent(id)+'.json?locations='+encodeURIComponent(city)+'&qualities='+quality,{signal:controller.signal})}finally{clearTimeout(timeout)}
  if(!res.ok)throw Error('Market API HTTP '+res.status);
  const data=await res.json();if(!Array.isArray(data))throw Error('Invalid market response');
  if(seq!==request||identity!==key())return;
  const matches=data.filter(x=>x.item_id===id&&String(x.city).toLowerCase()===city.toLowerCase()&&Number(x.quality)===quality&&Number(x.sell_price_min)>0&&Number.isFinite(stamp(x.sell_price_min_date))).sort((a,b)=>stamp(b.sell_price_min_date)-stamp(a.sell_price_min_date));
  if(!matches.length){get('craftMarketStatus').textContent='No reported sell order for this item, quality and city. Check the ID or enter a selling price manually.';return}
  const rec=matches[0],hours=Math.max(0,(Date.now()-stamp(rec.sell_price_min_date))/3600000);
  if(maxAge>0&&hours>maxAge){get('craftMarketStatus').textContent='Reported price '+money(rec.sell_price_min)+' is '+Math.round(hours)+'h old, beyond the selected freshness threshold. Not applied.';return}
  quote={price:Number(rec.sell_price_min),city,id,quality,date:rec.sell_price_min_date};
  get('craftMarketStatus').textContent='Lowest reported sell order · '+city+' · '+rec.sell_price_min_date+' UTC · '+Math.round(hours)+'h old. Asking price, not a guaranteed sale.';
  const sale=get('sellPrice');if(!sale.value||Number(sale.value)===0||sale.dataset.marketAutofill==='yes'){sale.dataset.marketAutofill='yes';sale.value=quote.price;}
  update();if(typeof craft==='function')craft();
 }catch(err){if(seq===request)get('craftMarketStatus').textContent='Could not fetch market value: '+err.message+'. You can still enter a selling price manually.'}
 finally{if(seq===request)button.disabled=false}
}
get('fetchCraftMarket').addEventListener('click',fetchQuote);
for(const id of ['itemSelect','craftTier','enchant','craftCity','craftQuality','craftMarketItemId','marketAge'])get(id).addEventListener('change',()=>invalidate('Selection changed. Fetch again for the updated item and crafting city.'));
get('craftMarketItemId').addEventListener('input',()=>invalidate('Item ID changed. Fetch again.'));
get('craftQty').addEventListener('input',update);
get('sellPrice').addEventListener('input',()=>{get('sellPrice').dataset.marketAutofill='no'});
window.albionCraftMarketSnapshot=()=>quote?{estimatedMarketUnit:quote.price,estimatedMarketTotal:quote.price*Math.max(1,Math.floor(Number(get('craftQty').value)||1)),marketCity:quote.city,marketItemId:quote.id,marketQuality:quote.quality,marketPriceDate:quote.date}:null;
update();
})();
