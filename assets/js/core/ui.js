import { qsa, qs, trapFocus } from "./utils.js";
import { getState, setTheme } from "./state.js";
document.documentElement.setAttribute("data-theme", getState().theme);
// Drawer + focus trap
const drawer = qs("#drawer"); const openD = qs("#openDrawer"); const closeD = qs("#closeDrawer"); let untrap=null;
if(openD && drawer && closeD){
  openD.addEventListener("click", ()=> { drawer.classList.add("show"); drawer.setAttribute('aria-hidden','false'); untrap = trapFocus(drawer); qs('#drawer [tabindex], #drawer button, #drawer a')?.focus?.(); });
  closeD.addEventListener("click", ()=> { drawer.classList.remove("show"); drawer.setAttribute('aria-hidden','true'); untrap && untrap(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") { drawer.classList.remove("show"); drawer.setAttribute('aria-hidden','true'); untrap && untrap(); } });
}
qsa(".themeBtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    setTheme(btn.dataset.theme);
    qsa('.themeBtn').forEach(b=> b.setAttribute('aria-pressed', String(b===btn)));
    const sel = qs("#setTheme"); if(sel) sel.value = btn.dataset.theme;
  });
});
// PWA registration (optional; only over http/https)
if('serviceWorker' in navigator && /^https?:/.test(location.protocol)){
  navigator.serviceWorker.register(new URL((document.querySelector('meta[name="sw-path"]').content||'sw.js'), document.baseURI), {scope: './'}).catch(()=>{});
}
