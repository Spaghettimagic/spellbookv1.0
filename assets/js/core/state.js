const LS_KEY = "spellbook.state.v4";
const defaultState = {
  theme: (localStorage.getItem('ms.theme')||'dark'),
  protect: (localStorage.getItem('ms.protect')||'on'),
  effects: [
    {id:'e1',title:'Arcane Key',cat:'Close-up',duration:160,diff:2,summary:'Una chiave apre un lucchetto scelto.',method:'Uso di una chiave gimmick con switch coperto.',materials:['chiave gimmick','lucchetto'],script:'Mostra la chiave antica…',media:[]},
    {id:'e2',title:'Celestial Sphere',cat:'Parlour',duration:210,diff:3,summary:'Un globo rivela costellazioni scelte.',method:'Forzatura + rivelazione luminosa.',materials:['sfera luminosa','telo nero'],script:'Parla di stelle e destino…',media:[]},
    {id:'e3',title:'Mind Echo',cat:'Mental',duration:180,diff:4,summary:'Indovini un pensiero con eco mentale.',method:'Dual reality + center tear.',materials:['bloc notes','penna'],script:'Chiedi di visualizzare…',media:[]}
  ],
  routine: [],
  routineNotes: "",
  events:[
    {date: new Date().toISOString().slice(0,10), title:'Cena aziendale – Milano'},
    {date: new Date(Date.now()+86400000*3).toISOString().slice(0,10), title:'Wedding – Parma'}
  ]
};
let state = null;
try{ state = JSON.parse(localStorage.getItem(LS_KEY)) || defaultState; }catch{ state = defaultState; }
export function getState(){ return state }
export function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)) }
export function setTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem('ms.theme', t); state.theme = t; saveState() }
export function setProtect(p){ localStorage.setItem('ms.protect', p); state.protect = p; saveState() }
export function overwriteEffects(effects){ state.effects = effects; saveState() }
export function overwriteRoutine(items){ state.routine = items; saveState() }
export default { getState, saveState, setTheme, setProtect, overwriteEffects, overwriteRoutine };
