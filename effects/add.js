import { $, wireActiveNav } from "../assets/js/core/utils.js";
import { addEffect } from "../assets/js/core/state.js";
import { generateUID } from "../assets/js/core/id.js";

wireActiveNav();

$("aeSave").addEventListener("click", async () => {
  const get = (v) => $(v).value.trim();
  const effect = {
    id: generateUID(),
    title: get("aeTitle"),
    cat: $("aeCat").value,
    duration: Number(get("aeDur") || 0),
    diff: Number(get("aeDiff") || 1),
    summary: get("aeSummary"),
    method: get("aeMethod"),
    materials: get("aeMaterials").split(/\n+/).filter(Boolean),
    script: get("aeScript"),
    media: []
  };
  if (!effect.title) { alert("Titolo obbligatorio"); return; }
  await addEffect(effect);
  alert("Effetto aggiunto");
  location.href = "index.html";
});
