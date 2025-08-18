import { $, fmtSec, downloadJSON, importJSON, printSheet, wireActiveNav, validateEffects } from "../assets/js/core/utils.js";
import { getState, saveState, overwriteRoutine } from "../assets/js/core/state.js";
wireActiveNav();
function getDragAfterElement(container, y){
  const els = [...container.querySelectorAll('.item:not(.dragging)')];
  return els.reduce((closest, child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if(offset < 0 && offset > closest.offset) return {offset, element:child};
    else return closest;
  }, {offset: Number.NEGATIVE_INFINITY}).element;
}
function addToRoutine(fx, position=null){ 
  const s=getState(); if(s.routine.find(i=>i.id===fx.id)) return; 
  if(position===null){ s.routine.push({...fx}) } else { s.routine.splice(position,0,{...fx}) }
  saveState(); renderRoutine(); 
}
function renderComposerFx(){ const root=$("composerFx"); root.innerHTML=""; getState().effects.forEach(fx=>{
  const card=document.createElement("div"); card.className="card";
  card.innerHTML=`<div class="center" style="width:56px;height:56px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)"><svg class="icon" style="color:var(--accent)"><use href="#ic-book"/></svg></div>
    <h4>${fx.title}</h4><button class="btn btn-primary" data-id="${fx.id}"><svg class="icon"><use href="#ic-plus"/></svg> Aggiungi</button>
    <p class="meta">${fx.cat} · ${fmtSec(fx.duration)} · Diff ${fx.diff}</p>`;
  card.querySelector("button").addEventListener("click",()=> addToRoutine(fx));
  // enable dragging from catalog
  card.draggable=true; card.addEventListener("dragstart", ev=>{ ev.dataTransfer.setData("text/plain", fx.id); });
  root.appendChild(card);
})}
function syncTotals(){
  const s = getState(); let total=0; const props=new Set();
  s.routine.forEach(it=>{ total+=it.duration; (it.materials||[]).forEach(m=>props.add(m)) });
  $("totalDur").textContent = fmtSec(total); $("propsCount").textContent = props.size;
  s.routineNotes = $("routineNotes").value; saveState();
}
function renderRoutine(){
  const s = getState(); const dz = $("dropZone"); dz.innerHTML="";
  if(s.routine.length===0){ dz.innerHTML = '<div class="meta">Trascina qui gli effetti… Oppure usa ▲ ▼</div>'; }
  s.routine.forEach((it,i)=>{
    const row = document.createElement("div"); row.className="item"; row.draggable=true; row.dataset.id=it.id;
    row.innerHTML = `<strong>${i+1}.</strong> ${it.title}
      <span class="chip" style="margin-left:auto">${fmtSec(it.duration)}</span>
      <div class="kb-controls" role="group" aria-label="Riordina">
        <button class="btn btn-secondary" data-action="up" data-id="${it.id}" aria-label="Su"><svg class="icon"><use href="#ic-up"/></svg></button>
        <button class="btn btn-secondary" data-action="down" data-id="${it.id}" aria-label="Giù"><svg class="icon"><use href="#ic-down"/></svg></button>
        <button class="btn btn-secondary" data-action="rm" data-id="${it.id}" aria-label="Rimuovi"><svg class="icon"><use href="#ic-delete"/></svg></button>
      </div>`;
    row.addEventListener("dragstart", ev=>{ row.classList.add('dragging'); ev.dataTransfer.setData("text/plain",it.id); });
    row.addEventListener("dragend", ()=> row.classList.remove('dragging'));
    dz.appendChild(row);
  });
  $("routineNotes").value = s.routineNotes || "";
  syncTotals();
}
const dz = $("dropZone");
dz.addEventListener("dragover", e=>{
  e.preventDefault();
  const afterEl = getDragAfterElement(dz, e.clientY);
  const dragging = dz.querySelector('.item.dragging');
  if(dragging){
    if(afterEl==null) dz.appendChild(dragging);
    else dz.insertBefore(dragging, afterEl);
  }
});
dz.addEventListener("drop", e=>{
  e.preventDefault();
  const id=e.dataTransfer.getData("text/plain");
  const s=getState();
  const fromCatalog = s.effects.find(x=>x.id===id) && !s.routine.find(r=>r.id===id);
  if(fromCatalog){
    const items=[...dz.querySelectorAll('.item')];
    const afterEl = getDragAfterElement(dz, e.clientY);
    const pos = afterEl ? items.indexOf(afterEl) : items.length;
    const fx=s.effects.find(x=>x.id===id); addToRoutine(fx, pos);
  } else {
    const order=[...dz.querySelectorAll('.item')].map(el=> el.dataset.id);
    s.routine = order.map(id=> s.routine.find(r=>r.id===id));
    saveState(); renderRoutine();
  }
});
document.addEventListener("click", e=>{ 
  const btn=e.target.closest('[data-action]'); if(!btn) return;
  const s=getState(); const idx=s.routine.findIndex(i=>i.id===btn.dataset.id);
  if(btn.dataset.action==="rm"){ s.routine.splice(idx,1); saveState(); renderRoutine(); }
  if(btn.dataset.action==="up" && idx>0){ const [it]=s.routine.splice(idx,1); s.routine.splice(idx-1,0,it); saveState(); renderRoutine(); }
  if(btn.dataset.action==="down" && idx<s.routine.length-1){ const [it]=s.routine.splice(idx,1); s.routine.splice(idx+1,0,it); saveState(); renderRoutine(); }
});
$("routineNotes").addEventListener("input", syncTotals);
$("btnSaveRoutine").addEventListener("click",()=>{ if(getState().routine.length===0){ alert("Aggiungi almeno un effetto."); return } alert("Routine salvata"); });
$("btnPacklist").addEventListener("click",()=>{ const set=new Set(); getState().routine.forEach(r=> (r.materials||[]).forEach(m=>set.add(m)) ); alert("Pack list:\n- "+Array.from(set).join("\n- ")) });
$("btnPrint").addEventListener("click",()=> printSheet("Foglio di palco — Spellbook", getState().routine));
$("btnExportRoutine").addEventListener("click", ()=> downloadJSON("routine.json", getState().routine));
$("importRoutine").addEventListener("change", async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  try{ const data = await importJSON(file); if(Array.isArray(data)){ overwriteRoutine(data); renderRoutine(); } else { alert("File non valido"); } }
  catch(err){ alert("Errore import: "+err.message) }
});
renderComposerFx(); renderRoutine();
