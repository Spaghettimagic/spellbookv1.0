import { $, fmtSec, wireActiveNav } from "../assets/js/core/utils.js";
import { getState } from "../assets/js/core/state.js";
wireActiveNav();
let pmTimer=null, pmStartTs=null;
function renderPmList(){ const sel=$("pmSelect"); sel.innerHTML = getState().effects.map(e=>`<option value='${e.id}'>${e.title}</option>`).join(""); }
function loadPmScript(){ const fx = getState().effects.find(f=>f.id===$("pmSelect").value); $("pmScript").textContent = fx?.script || "—" }
$("pmStart").addEventListener("click",()=>{ pmStartTs=Date.now(); clearInterval(pmTimer); pmTimer=setInterval(()=>{ $("pmTimer").textContent=fmtSec(Math.floor((Date.now()-pmStartTs)/1000)) },1000) })
$("pmReset").addEventListener("click",()=>{ clearInterval(pmTimer); $("pmTimer").textContent="00:00" })
$("pmSelect").addEventListener("change",loadPmScript);
renderPmList(); loadPmScript();
