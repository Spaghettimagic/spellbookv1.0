import { qsa, qs, trapFocus } from "./utils.js";
import { getState, setTheme } from "./state.js";
import { initReveal } from "./reveal.js";

const storedTheme = localStorage.getItem('ms.theme') || getState().theme;
setTheme(storedTheme);

// Initialize accent color from localStorage
const storedAccent = localStorage.getItem('ms.accent');
if (storedAccent) {
  document.documentElement.style.setProperty('--accent', storedAccent);
}

// Export helper to change accent color
export function setAccentColor(color) {
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem('ms.accent', color);
}

function updateThemeButtons(){
  const current = document.documentElement.getAttribute('data-theme');
  qsa('.themeBtn').forEach(b=> b.setAttribute('aria-pressed', b.dataset.theme === current ? 'true' : 'false'));
}
updateThemeButtons();
// Drawer + focus trap
const drawer = qs("#drawer"); const openD = qs("#openDrawer"); const closeD = qs("#closeDrawer"); let untrap=null;
if(openD && drawer && closeD){
  openD.addEventListener("click", ()=> { drawer.classList.add("show"); drawer.setAttribute('aria-hidden','false'); untrap = trapFocus(drawer); qs('#drawer [tabindex], #drawer button, #drawer a')?.focus?.(); });
  closeD.addEventListener("click", ()=> { drawer.classList.remove("show"); drawer.setAttribute('aria-hidden','true'); untrap && untrap(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") { drawer.classList.remove("show"); drawer.setAttribute('aria-hidden','true'); untrap && untrap(); } });
}

if(drawer){
  const mql = window.matchMedia('(min-width: 768px)');
  const updateDrawer = e => {
    if(e.matches){
      drawer.classList.add('show');
      drawer.setAttribute('aria-hidden','false');
      drawer.removeAttribute('tabindex');
    } else {
      drawer.classList.remove('show');
      drawer.setAttribute('aria-hidden','true');
      drawer.setAttribute('tabindex','-1');
    }
  };
  mql.addEventListener('change', updateDrawer);
  updateDrawer(mql);
}
qsa(".themeBtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    setTheme(btn.dataset.theme);
    updateThemeButtons();
    const sel = qs("#setTheme"); if(sel) sel.value = btn.dataset.theme;
  });
});
// PWA registration (optional; only over http/https)
if('serviceWorker' in navigator && /^https?:/.test(location.protocol)){
  navigator.serviceWorker.register(new URL((document.querySelector('meta[name="sw-path"]').content||'sw.js'), document.baseURI), {scope: './'}).catch(()=>{});
}
// Reveal surfaces on scroll
initReveal();
