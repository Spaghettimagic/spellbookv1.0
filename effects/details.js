import { initGlobalSearch } from "../assets/js/core/search-ui.js";
import { getState } from "../assets/js/core/state.js";
import { $, fmtSec, onKeySlashFocus, wireActiveNav } from "../assets/js/core/utils.js";

wireActiveNav();
onKeySlashFocus("#globalSearch");
initGlobalSearch();

// Ottieni ID effetto dalla URL
const urlParams = new URLSearchParams(location.search);
const effectId = urlParams.get('id');
let currentEffect = null;

// Gestione tabs
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Deseleziona tutti i tabs
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      const targetId = t.dataset.tab;
      document.getElementById(targetId).classList.add('hidden');
    });

    // Seleziona tab cliccato
    tab.setAttribute('aria-selected', 'true');
    const targetId = tab.dataset.tab;
    document.getElementById(targetId).classList.remove('hidden');
  });
});

// Carica dettagli effetto
function loadEffectDetails() {
  if (!effectId) {
    window.location.href = 'index.html';
    return;
  }

  const state = getState();
  const effect = state.effects.find(e => e.id === effectId);
  
  if (!effect) {
    alert('Effetto non trovato');
    window.location.href = 'index.html';
    return;
  }
  
  currentEffect = effect;
  
  // Popola dettagli
  document.title = `${effect.title} — Spellbook`;
  $('#fxTitle').textContent = effect.title;
  $('#fxSummary').textContent = effect.summary || '—';
  $('#fxCat').textContent = effect.cat || 'Categoria non specificata';
  $('#fxDur').textContent = fmtSec(effect.duration);
  $('#fxDiff').textContent = effect.diff;
  
  // Metodo
  if (effect.method) {
    $('#fxMethod').textContent = effect.method;
    // Imposta blur in base allo stato di protezione
    updateProtectionState();
  } else {
    $('#fxMethod').textContent = "Nessun metodo specificato";
  }
  
  // Materiali
  const materialsUl = $('#fxMaterials');
  materialsUl.innerHTML = '';
  
  if (effect.materials && effect.materials.length > 0) {
    effect.materials.forEach(material => {
      const li = document.createElement('li');
      li.textContent = material;
      materialsUl.appendChild(li);
    });
    $('#noMaterials').style.display = 'none';
  } else {
    $('#noMaterials').style.display = 'block';
  }
  
  // Script
  $('#fxScript').textContent = effect.script || 'Nessuno script specificato';
}

// Gestisce la protezione del metodo
function updateProtectionState() {
  const protect = getState().protect === 'on';
  const methodElement = $('#fxMethod');
  const protectBtn = $('#btnProtect');
  
  if (protect) {
    methodElement.style.filter = 'blur(5px)';
    protectBtn.textContent = 'Metodo protetto';
  } else {
    methodElement.style.filter = 'none';
    protectBtn.textContent = 'Nascondi metodo';
  }
}

// Mostra/Nascondi metodo
$('#revealMethod').addEventListener('click', () => {
  const methodElement = $('#fxMethod');
  
  if (methodElement.style.filter === 'blur(5px)') {
    methodElement.style.filter = 'none';
  } else {
    methodElement.style.filter = 'blur(5px)';
  }
});

// Aggiungi a routine
$('#btnAddToRoutine').addEventListener('click', () => {
  if (!currentEffect) return;
  
  // Aggiungi alla routine corrente e reindirizza
  const state = getState();
  const routine = [...state.routine, { id: currentEffect.id }];
  localStorage.setItem('spellbook.state.routine', JSON.stringify(routine));
  window.location.href = '../routine/index.html';
});

// Toggle protezione permanente
$('#btnProtect').addEventListener('click', () => {
  const state = getState();
  const newProtect = state.protect === 'on' ? 'off' : 'on';
  localStorage.setItem('ms.protect', newProtect);
  state.protect = newProtect;
  updateProtectionState();
});

// Stampa
$('#btnPrint').addEventListener('click', () => {
  if (!currentEffect) return;
  window.print();
});

// Condividi
$('#btnShare').addEventListener('click', () => {
  if (!currentEffect || !navigator.share) return;
  
  try {
    navigator.share({
      title: `${currentEffect.title} — Spellbook`,
      text: currentEffect.summary,
      url: window.location.href
    });
  } catch (e) {
    // Fallback se Web Share API non disponibile
    prompt('Copia questo link per condividere:', window.location.href);
  }
});

// Elimina effetto
$('#btnDelete').addEventListener('click', () => {
  if (!currentEffect || !confirm(`Sei sicuro di voler eliminare l'effetto "${currentEffect.title}"?`)) return;
  
  const state = getState();
  const newEffects = state.effects.filter(e => e.id !== currentEffect.id);
  localStorage.setItem('spellbook.state.v4', JSON.stringify({...state, effects: newEffects}));
  alert('Effetto eliminato con successo');
  window.location.href = 'index.html';
});

// Edit effetto
$('#btnEdit').addEventListener('click', () => {
  if (!currentEffect) return;
  window.location.href = `add.html?edit=${currentEffect.id}`;
});

// Init
loadEffectDetails();