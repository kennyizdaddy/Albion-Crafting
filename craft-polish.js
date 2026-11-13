// Presentation-only feedback; does not modify prices, formulas, or journal records.
(()=>{const root=document.getElementById('crafting');if(!root)return;
const ids=['craftCost','craftUnitCost','craftProfit'];
for(const id of ids){const el=document.getElementById(id);if(!el)continue;let previous=el.textContent;
new MutationObserver(()=>{const current=el.textContent;if(current===previous)return;previous=current;
if(id==='craftProfit'){const n=Number(current.replace(/[^0-9.\-]/g,''));el.classList.toggle('profit-positive',Number.isFinite(n)&&n>0);el.classList.toggle('profit-negative',Number.isFinite(n)&&n<0);}
el.classList.remove('craft-value-updated');void el.offsetWidth;el.classList.add('craft-value-updated');}).observe(el,{childList:true,characterData:true,subtree:true});}
const status=document.getElementById('journalSaveStatus');if(status){new MutationObserver(()=>{const s=status.textContent.trim();status.classList.toggle('craft-save-success',/saved|success|added/i.test(s)&&!/not saved|failed|error/i.test(s));}).observe(status,{childList:true,characterData:true,subtree:true});}
})();
