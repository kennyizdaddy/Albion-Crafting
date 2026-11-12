// General crafting fame: values from Crafting Fame Database in the user workbook.
// Fame = standard refined resource count * tier fame/resource * 2^enchantment.
// 1H=24, 2H=32, offhands/helmets/boots=8, chest=16. Capes not modeled.
(()=>{
 const $=id=>document.getElementById(id);
 const perResource={4:22.5,5:90,6:270,7:645,8:1395};
 const fmt=n=>Math.round(n).toLocaleString('en-US');
 const storageKey='albion-atlas-general-node-v1';
 let state={};try{state=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch{}
 const nodeName=()=>{const c=$('equipmentSelect').value;
  if(c!=='Weapons')return c;
  const item=window.items?.find(x=>x.name===$('itemSelect').value);
  if(!item)return 'Weapons';
  const mats=item.materials||[];
  const standard=mats.filter(m=>/^Tier 4 (Plank|Bar|Cloth|Leather|Stone|Metal Bar)/i.test(m.name)).reduce((sum,m)=>sum+Number(m.qty||0),0);
  return standard>=28?'2H Weapons':'1H Weapons';
 };
 const amounts={'1H Weapons':24,'2H Weapons':32,'Off-Hands':8,'Helmets':8,'Boots':8,'Chest':16};
 let active='';
 function save(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{}}
 function refresh(){
  const node=nodeName();if(node!==active){active=node;const v=state[node]||{};$('nodeCurrent').value=v.current??0;$('nodeTarget').value=v.target??'';$('nodePremium').value=v.premium??'1'}
  const t=Number($('craftTier').value),e=Number($('enchant').value),q=Math.max(1,Math.floor(Number($('craftQty').value)||1));
  const base=amounts[node];const per=base?base*perResource[t]*2**e*Number($('nodePremium').value):null;
  const current=Math.max(0,Number($('nodeCurrent').value)||0),target=Number($('nodeTarget').value);
  $('nodePerItem').textContent=per===null?'Not modeled':fmt(per);
  $('nodeBatch').textContent=per===null?'—':fmt(per*q);
  $('nodeProjected').textContent=per===null?'—':fmt(current+per*q);
  $('nodeNeeded').textContent=per===null||!(target>0)?'—':fmt(Math.ceil(Math.max(0,target-current)/per));
  $('nodeBar').style.width=(target>0?Math.min(100,100*current/target):0)+'%';
  $('nodeStatus').textContent=per===null?'No verified fame model for '+node+'.':(node+' · '+fmt(current)+' fame tracked'+(target>0?' · '+fmt(Math.max(0,target-current))+' remaining before this batch':' · set a milestone to track progress')+'.');
  return {node,per,q,current,target};
 }
 ['nodeCurrent','nodeTarget','nodePremium'].forEach(id=>$(id).addEventListener('input',()=>{const v=refresh();state[v.node]={current:v.current,target:$('nodeTarget').value,premium:$('nodePremium').value};save()}));
 $('nodeApply').addEventListener('click',()=>{const v=refresh();if(v.per===null)return;const next=v.current+v.per*v.q;$('nodeCurrent').value=Math.round(next);state[v.node]={current:Math.round(next),target:$('nodeTarget').value,premium:$('nodePremium').value};save();refresh();$('nodeStatus').textContent='Added '+fmt(v.per*v.q)+' estimated fame to '+v.node+'.'});
 ['equipmentSelect','typeSelect','itemSelect','craftTier','enchant','craftQty'].forEach(id=>$(id).addEventListener('change',()=>setTimeout(refresh,0)));
 $('craftQty').addEventListener('input',refresh);
 // Item database loads asynchronously; refresh after recipe selection is populated.
 const watch=new MutationObserver(()=>refresh());watch.observe($('itemSelect'),{childList:true});
 refresh();
})();
