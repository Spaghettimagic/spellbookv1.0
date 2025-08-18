export const $ = (id) => document.getElementById(id);
export const qs = (sel, root=document)=> root.querySelector(sel);
export const qsa = (sel, root=document)=> Array.from(root.querySelectorAll(sel));
export const fmtSec = (s)=>{ s=Number(s)||0; const m=Math.floor(s/60), r=String(s%60).padStart(2,'0'); return `${m}:${r}`; };
export function wireActiveNav(){
  const cur = location.pathname.replace(/\/index\.html$/, '/');
  qsa('.bottombar a').forEach(a=>{
    const dest = new URL(a.getAttribute('href'), location.href).pathname.replace(/\/index\.html$/, '/');
    a.setAttribute('aria-current', dest===cur ? 'page' : 'false');
  });
}
export function downloadJSON(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {href:url, download:filename});
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
export async function importJSON(file){ const text = await file.text(); return JSON.parse(text) }
export function printSheet(title, items){
  const w = window.open("", "_blank");
  const rows = items.map((it,i)=> `<tr><td>${i+1}</td><td>${it.title}</td><td>${fmtSec(it.duration)}</td><td>${(it.materials||[]).join(", ")}</td></tr>`).join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:system-ui,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}</style>
  </head><body><h1>${title}</h1><table><thead><tr><th>#</th><th>Effetto</th><th>Durata</th><th>Props</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
  w.document.close(); w.focus(); try{ w.print(); }catch{}
}
export function onKeySlashFocus(input){
  document.addEventListener('keydown', (e)=>{
    if(e.key==='/'){ const target = typeof input==='string' ? qs(input) : input; if(target){ e.preventDefault(); target.focus(); target.select?.(); } }
  });
}
export function trapFocus(container){
  const selectors = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const nodes = () => qsa(selectors, container).filter(el=>!el.hasAttribute('disabled'));
  function onKey(e){
    if(e.key!=='Tab') return;
    const f = nodes(); if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKey);
  return ()=> container.removeEventListener('keydown', onKey);
}
export function validateEffects(data){
  if(!Array.isArray(data)) return {ok:false, error:"Array mancante"};
  for(const o of data){
    if(typeof o.title!=='string' || !o.title.trim()) return {ok:false,error:"Titolo obbligatorio"};
    if(typeof o.duration!=='number') return {ok:false,error:"Durata non numerica"};
    if(typeof o.diff!=='number') return {ok:false,error:"Diff non numerica"};
  }
  return {ok:true};
}
