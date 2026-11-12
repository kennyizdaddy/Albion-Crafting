// Generalist node progression. Names, item mappings, tier fame and level curves from the user's workbook.
(()=>{
'use strict';
const $=id=>document.getElementById(id), data=window.ALBION_NODE_DATA;
if(!data||!$('nodeSelect'))return;
const fmt=n=>Math.round(n).toLocaleString('en-US');
const key='albion-atlas-general-node-v2';
let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
const nodes=$('nodeSelect'),item=$('nodeItem');
for(const n of data.nodes){const o=document.createElement('option');o.value=n.name;o.textContent=n.name;nodes.append(o)}
function store(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{}}
function available(){
 const node=data.nodes.find(n=>n.name===nodes.value);
 if(!node)return [];
 // Armor nodes use the exact category and subcategory from Crafting Setup (items.json).
 // No name guessing: Cloth/Leather/Plate and Helmets/Chest/Boots must both match.
 if(node.subcategory)return data.items.filter(x=>x.category===node.category&&x.family===node.subcategory);
 const family=node.name.replace(/ Crafter$/,'');
 return data.items.filter(x=>x.category===node.category&&x.family===family);
}
function setItems(){
 const old=item.value;item.replaceChildren();
 for(const x of available()){const o=document.createElement('option');o.value=x.name;o.textContent=x.name;item.append(o)}
 if([...item.options].some(o=>o.value===old))item.value=old;
 render();
}
function restore(){const v=saved[nodes.value]||{};
 $('nodeLevel').value=v.level??0;$('nodeCurrent').value=v.current??0;$('nodeTarget').value=v.target??10;
 $('nodePremium').value=v.premium??'1';$('nodeTier').value=v.tier??'4';$('nodeEnchant').value=v.enchant??'0';
 setItems();if(v.item&&[...item.options].some(o=>o.value===v.item))item.value=v.item;render();
}
function persist(){saved[nodes.value]={level:$('nodeLevel').value,current:$('nodeCurrent').value,target:$('nodeTarget').value,premium:$('nodePremium').value,tier:$('nodeTier').value,enchant:$('nodeEnchant').value,item:item.value};store()}
function render(){
 const n=data.nodes.find(n=>n.name===nodes.value);if(!n)return;
 const x=data.items.find(x=>x.name===item.value&&x.category===n.category);
 const tier=Number($('nodeTier').value),ench=Number($('nodeEnchant').value),premium=Number($('nodePremium').value);
 const fame=x?x.resources*data.famePerResource[tier]*2**ench*premium:NaN;
 const levels=data.curves[n.group],level=Math.max(0,Math.min(100,Math.trunc(Number($('nodeLevel').value)||0))),target=Math.max(1,Math.min(100,Math.trunc(Number($('nodeTarget').value)||1)));
 const earned=Math.max(0,Number($('nodeCurrent').value)||0),maxCurrent=level<100?levels[level+1]-levels[level]:0;
 const invalid=level>=100||target<=level||earned>maxCurrent;
 const remaining=target<=level?0:Math.max(0,levels[target]-levels[level]-earned);
 $('nodePerItem').textContent=Number.isFinite(fame)?fmt(fame):'Select an item';
 $('nodeRemaining').textContent=invalid?'—':fmt(remaining);
 $('nodeNeeded').textContent=invalid||!Number.isFinite(fame)||fame<=0?'—':fmt(Math.ceil(remaining/fame));
 $('nodeBar').style.width=level>=100?'100%':Math.min(100,100*earned/Math.max(1,maxCurrent))+'%';
 let status='';
 if(!x)status='No matching item found for this node in the workbook.';
 else if(level>=100)status='Current node is already level 100.';
 else if(earned>maxCurrent)status='Current-level fame exceeds the fame required for this level. Update the current level or fame.';
 else if(target<=level)status='Target level must be greater than your current level.';
 else status=`${n.name} · ${fmt(earned)} / ${fmt(maxCurrent)} fame in current level · ${fmt(remaining)} fame to level ${target}.`;
 $('nodeStatus').textContent=status;
}
nodes.addEventListener('change',restore);
for(const id of ['nodeItem','nodeTier','nodeEnchant','nodePremium','nodeLevel','nodeCurrent','nodeTarget'])$(id).addEventListener('input',()=>{render();persist()});
restore();
})();
