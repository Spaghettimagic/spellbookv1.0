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

export function getState() { return state; }
export function saveState() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
export function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ms.theme', t);
  state.theme = t;
  saveState();
}
export function setProtect(p) {
  localStorage.setItem('ms.protect', p);
  state.protect = p;
  saveState();
}
export function overwriteEffects(effects) { state.effects = effects; saveState(); }
export function overwriteRoutine(items) { state.routine = items; saveState(); }
export default { getState, saveState, setTheme, setProtect, overwriteEffects, overwriteRoutine };
