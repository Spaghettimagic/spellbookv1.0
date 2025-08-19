const LS_KEY = "spellbook.state.v4";

let defaultState;
try {
  const res = await fetch("../../../data/default-state.json");
  defaultState = await res.json();
} catch (e) {
  defaultState = {
    theme: "dark",
    protect: "on",
    effects: [],
    routine: [],
    routineNotes: "",
    events: []
  };
}

let state;
try {
  state = JSON.parse(localStorage.getItem(LS_KEY)) || defaultState;
} catch {
  state = defaultState;
}

try {
  const res = await fetch('/api/effects');
  const effects = await res.json();
  state.effects = effects;
  saveState();
} catch (e) {
  console.error('Impossibile caricare gli effetti dal server', e);
}

export function getState() { return state; }
export function saveState() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
let systemThemeMql;
function applySystemTheme(e){
  document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
}
export function setTheme(t) {
  if(systemThemeMql){
    systemThemeMql.removeEventListener('change', applySystemTheme);
    systemThemeMql = null;
  }
  if(t === 'auto'){
    systemThemeMql = window.matchMedia('(prefers-color-scheme: dark)');
    applySystemTheme(systemThemeMql);
    systemThemeMql.addEventListener('change', applySystemTheme);
  } else {
    document.documentElement.setAttribute('data-theme', t);
  }
  localStorage.setItem('ms.theme', t);
  state.theme = t;
  saveState();
}
export function setProtect(p) {
  localStorage.setItem('ms.protect', p);
  state.protect = p;
  saveState();
}
export async function addEffect(effect) {
  await fetch('/api/effects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(effect)
  });
  state.effects.unshift(effect);
  saveState();
}

export async function deleteEffect(id) {
  await fetch(`/api/effects/${id}`, { method: 'DELETE' });
  state.effects = state.effects.filter(e => e.id !== id);
  saveState();
}

export async function overwriteEffects(effects) {
  await fetch('/api/effects', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(effects)
  });
  state.effects = effects;
  saveState();
}
export function overwriteRoutine(items) { state.routine = items; saveState(); }
export default { getState, saveState, setTheme, setProtect, addEffect, deleteEffect, overwriteEffects, overwriteRoutine };
