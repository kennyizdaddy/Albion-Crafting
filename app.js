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
 const item=items.find(x=>x.name===$('itemSelect').value);$('recipe').replaceChildren();$('itemCityNote').textContent=item?'Workbook bonus city: '+(item.bonusCity||'Not specified'):'';if(!item)return;
 for(const [i,m] of item.materials.entries()){
  const d=document.createElement('div');d.className='material';
  const isArtifact=!/^Tier \d+ (Plank|Bar|Cloth|Leather|Stone|Metal Bar)/i.test(m.name);
  const tier=$('craftTier').value,ench=$('enchant').value;
  const label=m.name.replace(/Tier 4/g,'Tier '+tier)+(isArtifact?'':'.'+ench);
  d.innerHTML=`<strong></strong><small></small><div class="twocol"><label>Buy price / unit<input type="number" min="0" step="any" placeholder="Required" class="buyprice"></label>${isArtifact?'':`<label>Self-refined cost / unit<input type="number" min="0" step="any" placeholder="Required for comparison" class="refprice"></label>`}</div>${isArtifact?'':`<label>Source<select class="source"><option value="buy">Buy</option><option value="refine">Refine</option></select></label>`}`;
  d.querySelector('strong').textContent=label;d.querySelector('small').textContent='Required per craft: '+m.qty+(isArtifact?' · no crafting resource return':'');
  d.dataset.qty=m.qty;d.dataset.artifact=isArtifact?'yes':'no';$('recipe').append(d)
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
for(const id of ['craftQty','sellPrice','craftCity','craftFocus','craftDaily','craftRrr','craftFee','craftTax'])$(id).addEventListener('input',craft);for(const id of ['resource','refTier','refQty','rawPrice','prevPrice','refSell','refFee','refFocus','refBonus','refDaily','refRrr'])$(id).addEventListener('input',refining);$('equipmentSelect').addEventListener('change',updateTypes);$('typeSelect').addEventListener('change',updateItems);$('itemSelect').addEventListener('change',recipe);$('craftTier').addEventListener('change',recipe);$('enchant').addEventListener('change',recipe);$('search').addEventListener('input',database);fetch('items.json').then(r=>r.json()).then(data=>{items=data;fillSelect('equipmentSelect',['Boots','Chest','Helmets','Capes','Weapons'],'Boots');updateTypes();database()}).catch(()=>{$('recipe').textContent='Item database could not load. Open the site using a local server or GitHub Pages.'});refining();
