import { $, wireActiveNav } from "../assets/js/core/utils.js";
import { addEffect } from "../assets/js/core/state.js";
wireActiveNav();
function uid(){ return 'e'+Date.now().toString(36)+(Math.random()*1e6|0).toString(36) }
$("aeSave").addEventListener("click",async()=>{
  const get=v=>$(v).value.trim();
  const fx={ id:uid(), title:get("aeTitle"), cat:$("aeCat").value, duration:Number(get("aeDur")||0), diff:Number(get("aeDiff")||1), summary:get("aeSummary"), method:get("aeMethod"), materials:get("aeMaterials").split(/\n+/).filter(Boolean), script:get("aeScript"), media:[] };
  if(!fx.title){ alert("Titolo obbligatorio"); return }
  await addEffect(fx);
  alert("Effetto aggiunto");
  location.href = "index.html";
});
