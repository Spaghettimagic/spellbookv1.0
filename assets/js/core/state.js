import { validateEffects } from './utils.js';
const STORAGE_KEY = 'spellbook.state.v5';

function getDefaultState(){ return { effects:[], events:[] }; }

export function getState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultState();
  } catch { return getDefaultState(); }
}

export function saveState(s){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export async function fetchEffects(){
  const res = await fetch('/api/effects');
  if(!res.ok) throw new Error('Failed to fetch effects');
  const list = await res.json();
  const s = getState(); s.effects = list; saveState(s);
  return list;
}

export async function addEffect(effect){
  const res = await fetch('/api/effects',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(effect) });
  if(!res.ok) throw new Error((await res.json()).error || 'Failed to add effect');
  const saved = await res.json();
  const s = getState(); s.effects.unshift(saved); saveState(s);
  return saved;
}

export async function deleteEffect(id){
  const res = await fetch(`/api/effects/${encodeURIComponent(id)}`,{ method:'DELETE' });
  if(!res.ok) throw new Error((await res.json()).error || 'Failed to delete effect');
  const s = getState(); s.effects = s.effects.filter(e=>e.id!==id); saveState(s);
}

export async function overwriteEffects(effects){
  const v = validateEffects(effects); if(!v.ok) throw new Error(v.error);
  const res = await fetch('/api/effects',{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(effects) });
  if(!res.ok) throw new Error((await res.json()).error || 'Failed to overwrite effects');
  const s = getState(); s.effects = effects; saveState(s);
}
