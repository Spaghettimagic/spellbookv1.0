export function $(id){ return document.getElementById(id); }
export function qs(sel,root=document){ return root.querySelector(sel); }
export function qsa(sel,root=document){ return [...root.querySelectorAll(sel)]; }

export function fmtSec(s=0){
  s = Math.max(0, Number(s)||0);
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
           : `${m}:${String(sec).padStart(2,'0')}`;
}

export function onKeySlashFocus(selector='#globalSearch'){
  document.addEventListener('keydown', e=>{
    if(e.key==='/' && !e.metaKey && !e.ctrlKey && !e.altKey){
      const el = qs(selector); if(el){ e.preventDefault(); el.focus(); }
    }
  });
}

export function wireActiveNav(){
  const path = location.pathname;
  qsa('nav a').forEach(a => { if (a.getAttribute('href') && path.endsWith(a.getAttribute('href'))) a.classList.add('active'); });
}

export function downloadJSON(filename, data){
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}

export function importJSONFromFile(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = () => { try{ resolve(JSON.parse(r.result)); } catch(e){ reject(e); } };
    r.onerror = reject;
    r.readAsText(file);
  });
}

export function trapFocus(modal){
  const f = qsa('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])', modal);
  if(!f.length) return;
  let i=0; f[0].focus();
  modal.addEventListener('keydown', e=>{
    if(e.key!=='Tab') return;
    e.preventDefault(); i = (i + (e.shiftKey ? -1 : 1) + f.length) % f.length; f[i].focus();
  });
}

export function validateEffects(effects){
  if(!Array.isArray(effects)) return { ok:false, error:'Effects must be an array' };
  const ids = new Set();
  for(const e of effects){
    if(!e || typeof e!=='object') return { ok:false, error:'Invalid effect' };
    if(typeof e.title!=='string' || !e.title.trim()) return { ok:false, error:'Title is required' };
    if(e.id){ if(ids.has(e.id)) return { ok:false, error:'Duplicate id' }; ids.add(e.id); }
  }
  return { ok:true };
}
