import { initGlobalSearch } from "../assets/js/core/search-ui.js";
import { getState } from "../assets/js/core/state.js";
import { $, fmtSec, onKeySlashFocus, wireActiveNav } from "../assets/js/core/utils.js";

wireActiveNav();
onKeySlashFocus("#globalSearch");
initGlobalSearch();

// Variabili globali
let showInterval = null;
let totalSeconds = 0;
let currentIndex = -1;
let effectDurations = [];
let effectStartTimes = [];
let totalRoutineDuration = 0;
let playingState = false;
const modal = $("showModal");

// Carica i dati della routine
function loadRoutine() {
  const state = getState();
  const routine = state.routine || [];
  const setlist = $("showSetlist");
  setlist.innerHTML = "";
  effectDurations = [];
  effectStartTimes = [0];
  totalRoutineDuration = 0;
  currentIndex = -1;
  
  if (routine.length === 0) {
    setlist.innerHTML = `
      <div class="surface-2" style="padding:16px;text-align:center;border-radius:var(--r-l)">
        <svg class="icon" style="width:40px;height:40px;opacity:0.6;margin:0 auto 12px">
          <use href="#ic-list"/>
        </svg>
        <h4>Nessun effetto nella routine</h4>
        <p class="meta">Vai al Routine Composer per creare una setlist</p>
        <a href="../routine/index.html" class="btn btn-secondary" style="margin-top:10px">Crea routine</a>
      </div>
    `;
    return;
  }
  
  // Calcola durate e tempi di inizio
  let cumulative = 0;
  routine.forEach((item, i) => {
    const effect = state.effects.find(e => e.id === item.id);
    if (effect) {
      const duration = effect.duration || 0;
      effectDurations.push(duration);
      
      if (i > 0) {
        effectStartTimes.push(cumulative);
      }
      cumulative += duration;
      totalRoutineDuration += duration;
    } else {
      effectDurations.push(0);
      if (i > 0) {
        effectStartTimes.push(cumulative);
      }
    }
  });
  
  // Aggiorna durata totale visualizzata
  $("totalDuration").textContent = fmtSec(totalRoutineDuration);
  
  // Crea elementi setlist
  routine.forEach((item, i) => {
    const effect = state.effects.find(e => e.id === item.id);
    if (!effect) return;
    
    const el = document.createElement("div");
    el.className = "setlist-item surface-2";
    el.dataset.index = i;
    el.style.padding = "12px";
    el.style.borderRadius = "var(--r-l)";
    el.style.marginBottom = "8px";
    el.style.cursor = "pointer";
    el.style.transition = "background 0.2s ease";
    
    el.innerHTML = `
      <div class="cluster" style="justify-content:space-between">
        <div>
          <h4 style="margin:0 0 4px">${effect.title}</h4>
          <span class="meta">${effect.cat} · ${fmtSec(effect.duration)}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="chip" data-start-at>${fmtSec(effectStartTimes[i])}</span>
          <button class="btn btn-secondary btn-sm" style="padding:4px 10px;min-height:32px">Vai</button>
        </div>
      </div>
    `;
    
    // Aggiungi evento click
    el.addEventListener("click", () => {
      setCurrentEffect(i);
      updateUI();
    });
    
    setlist.appendChild(el);
  });
}

// Imposta l'effetto corrente
function setCurrentEffect(index) {
  const state = getState();
  const routine = state.routine || [];
  
  if (index < 0 || index >= routine.length) {
    currentIndex = -1;
    $("showCurrent").textContent = "—";
    return;
  }
  
  // Aggiorna indice corrente
  currentIndex = index;
  
  // Se in riproduzione, aggiorna il timer
  if (playingState) {
    totalSeconds = effectStartTimes[currentIndex];
    updateTimerDisplay();
  }
  
  // Trova effetto
  const effect = state.effects.find(e => e.id === routine[currentIndex].id);
  if (!effect) {
    $("showCurrent").textContent = "Effetto non trovato";
    return;
  }
  
  // Aggiorna UI
  $("showCurrent").textContent = effect.title;
  
  // Aggiorna tutte le voci della setlist
  document.querySelectorAll('.setlist-item').forEach((item, i) => {
    if (i === currentIndex) {
      item.style.background = "color-mix(in oklab, var(--accent), transparent 85%)";
      item.style.borderLeft = "4px solid var(--accent)";
    } else {
      item.style.background = "var(--surface-2)";
      item.style.borderLeft = "none";
    }
  });
  
  // Reset progress bar
  $("effectProgress").style.width = "0%";
}

// Aggiorna l'interfaccia
function updateUI() {
  const state = getState();
  const routine = state.routine || [];
  
  // Aggiorna pulsante Start/Pause
  if (playingState) {
    $("showStart").innerHTML = `
      <svg class="icon" style="width:24px;height:24px;margin-right:6px">
        <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
        <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
      </svg>
      Pausa
    `;
  } else {
    $("showStart").innerHTML = `
      <svg class="icon" style="width:24px;height:24px;margin-right:6px">
        <path d="M8 5v14l11-7z" fill="currentColor"/>
      </svg>
      Start
    `;
  }
  
  // Disabilita pulsanti navigazione se necessario
  $("showPrev").disabled = currentIndex <= 0;
  $("showNextBtn").disabled = currentIndex >= routine.length - 1 || currentIndex === -1;
}

// Aggiorna il display del timer
function updateTimerDisplay() {
  $("showTimer").textContent = fmtSec(totalSeconds);
  
  // Aggiorna progress bar se un effetto è selezionato
  if (currentIndex >= 0 && playingState) {
    const effectDuration = effectDurations[currentIndex];
    if (effectDuration > 0) {
      const effectStartTime = effectStartTimes[currentIndex];
      const elapsedInEffect = totalSeconds - effectStartTime;
      const progressPercentage = Math.min(100, (elapsedInEffect / effectDuration) * 100);
      $("effectProgress").style.width = `${progressPercentage}%`;
      
      // Cambia colore quando si avvicina alla fine
      if (progressPercentage > 80) {
        $("effectProgress").style.background = "var(--warning)";
      } else {
        $("effectProgress").style.background = "var(--accent)";
      }
    }
  }
}

// Avvia o mette in pausa il timer
function toggleTimer() {
  if (playingState) {
    // Pausa timer
    clearInterval(showInterval);
    playingState = false;
  } else {
    // Se nessun effetto selezionato, imposta il primo
    if (currentIndex === -1) {
      setCurrentEffect(0);
    }
    
    // Avvia timer
    showInterval = setInterval(() => {
      totalSeconds++;
      updateTimerDisplay();
      
      // Controlla se è ora di passare al prossimo effetto
      const state = getState();
      const routine = state.routine || [];
      
      if (currentIndex >= 0 && currentIndex < routine.length - 1) {
        const nextStartTime = effectStartTimes[currentIndex + 1];
        if (totalSeconds >= nextStartTime) {
          // Passa al prossimo effetto
          setCurrentEffect(currentIndex + 1);
        }
      }
    }, 1000);
    playingState = true;
  }
  
  updateUI();
}

// Reset timer
function resetTimer() {
  clearInterval(showInterval);
  totalSeconds = 0;
  playingState = false;
  updateTimerDisplay();
  setCurrentEffect(0);
  updateUI();
}

// Passa all'effetto precedente
function prevEffect() {
  if (currentIndex > 0) {
    setCurrentEffect(currentIndex - 1);
    updateUI();
  }
}

// Passa all'effetto successivo
function nextEffect() {
  const state = getState();
  const routine = state.routine || [];
  if (currentIndex < routine.length - 1) {
    setCurrentEffect(currentIndex + 1);
    updateUI();
  }
}

// Toggle stage mode (high contrast)
function toggleStageMode() {
  const html = document.documentElement;
  if (html.dataset.theme === "hc") {
    html.dataset.theme = localStorage.getItem('ms.theme') || "dark";
    $("stageMode").textContent = "HC Mode";
  } else {
    html.dataset.theme = "hc";
    $("stageMode").textContent = "Normal Mode";
  }
}

// Entra in modalità fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Errore fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Mostra note della routine
function showNotes() {
  const notes = getState().routineNotes || "Nessuna nota disponibile";
  $("modalTitle").textContent = "Note della routine";
  $("modalContent").innerHTML = `<pre style="white-space:pre-wrap;font-family:inherit;line-height:1.6">${notes || 'Nessuna nota'}</pre>`;
  modal.classList.remove("hidden");
}

// Mostra materiali necessari
function showPackingList() {
  const state = getState();
  const routine = state.routine || [];
  let materials = new Set();
  
  // Raccogli tutti i materiali
  routine.forEach(item => {
    const effect = state.effects.find(e => e.id === item.id);
    if (effect && effect.materials) {
      effect.materials.forEach(m => materials.add(m));
    }
  });
  
  // Visualizza lista
  $("modalTitle").textContent = "Lista materiali";
  
  if (materials.size === 0) {
    $("modalContent").innerHTML = '<p>Nessun materiale specificato</p>';
  } else {
    $("modalContent").innerHTML = `
      <ul style="margin-left:20px">
        ${Array.from(materials).map(m => `<li>${m}</li>`).join('')}
      </ul>
    `;
  }
  
  modal.classList.remove("hidden");
}

// Event listeners
$("showStart")?.addEventListener("click", toggleTimer);
$("showReset")?.addEventListener("click", resetTimer);
$("showPrev")?.addEventListener("click", prevEffect);
$("showNextBtn")?.addEventListener("click", nextEffect);
$("stageMode")?.addEventListener("click", toggleStageMode);
$("showFullscreen")?.addEventListener("click", toggleFullscreen);
$("showNotes")?.addEventListener("click", showNotes);
$("showPackingList")?.addEventListener("click", showPackingList);
$("closeModal")?.addEventListener("click", () => modal.classList.add("hidden"));

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "KeyK") {
    // Spazio o K = Play/Pause
    e.preventDefault();
    toggleTimer();
  } else if (e.code === "KeyJ" || e.code === "ArrowLeft") {
    // J o Freccia sinistra = Precedente
    e.preventDefault();
    prevEffect();
  } else if (e.code === "KeyL" || e.code === "ArrowRight") {
    // L o Freccia destra = Successivo
    e.preventDefault();
    nextEffect();
  } else if (e.code === "KeyR") {
    // R = Reset
    e.preventDefault();
    resetTimer();
  } else if (e.code === "KeyF") {
    // F = Fullscreen
    e.preventDefault();
    toggleFullscreen();
  } else if (e.code === "Escape" && !modal.classList.contains("hidden")) {
    // ESC chiude il modale
    modal.classList.add("hidden");
  }
});

// Inizializza
loadRoutine();
updateUI();

// Controlla se c'è un parametro nella URL per avviare automaticamente
if (location.search.includes('autostart=true')) {
  toggleTimer();
}