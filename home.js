import { initNotificationSystem, showToast } from "./assets/js/core/notifications.js";
import { initGlobalSearch } from "./assets/js/core/search-ui.js";
import { getState } from "./assets/js/core/state.js";
import { $, fmtSec, onKeySlashFocus, wireActiveNav } from "./assets/js/core/utils.js";

wireActiveNav();
onKeySlashFocus("#globalSearch");
initGlobalSearch();

// Inizializza sistema di notifiche
initNotificationSystem();
// Modal per aggiungere eventi
function showAddEventModal() {
  // Crea modal container se non esiste
  let modal = document.getElementById('eventModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eventModal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '100';
    
    document.body.appendChild(modal);
  }
  
  // Popola il modal
  const today = new Date().toISOString().slice(0, 10);
  
  modal.innerHTML = `
    <div class="surface" style="max-width:500px;width:90%;padding:24px;border-radius:var(--r-l)">
      <h3 class="h3" style="margin:0 0 16px">Aggiungi evento</h3>
      <div class="stack" style="gap:16px">
        <div class="field">
          <label class="label" for="eventDate">Data</label>
          <input type="date" id="eventDate" class="input" value="${today}" min="${today}">
        </div>
        <div class="field">
          <label class="label" for="eventTitle">Titolo</label>
          <input type="text" id="eventTitle" class="input" placeholder="Titolo evento...">
        </div>
        <div class="cluster" style="justify-content:flex-end;gap:12px">
          <button id="cancelEvent" class="btn btn-secondary">Annulla</button>
          <button id="saveEvent" class="btn btn-primary">Salva</button>
        </div>
      </div>
    </div>
  `;
  
  // Aggiungi event listeners
  document.getElementById('cancelEvent').addEventListener('click', () => {
    modal.remove();
  });
  
  document.getElementById('saveEvent').addEventListener('click', () => {
    const date = document.getElementById('eventDate').value;
    const title = document.getElementById('eventTitle').value;
    
    if (!date || !title) {
      alert('Inserisci data e titolo');
      return;
    }
    
    // Salva evento
    const state = getState();
    state.events.push({ date, title });
    localStorage.setItem('spellbook.state.v4', JSON.stringify(state));
    
    // Aggiorna UI
    modal.remove();
    refreshHome();
    
    // Mostra toast di conferma
    showToast('Evento aggiunto con successo', { type: 'success' });
  });
}

// Calcola statistiche
function calculateStats() {
  const state = getState();
  const stats = {
    effectCount: state.effects.length,
    eventCount: state.events.length,
    totalDuration: 0,
    materialCount: 0,
    categories: {},
    materialsUsed: new Set()
  };
  
  // Calcola statistiche dagli effetti
  state.effects.forEach(effect => {
    // Durata totale
    stats.totalDuration += effect.duration || 0;
    
    // Conteggio categorie
    if (effect.cat) {
      stats.categories[effect.cat] = (stats.categories[effect.cat] || 0) + 1;
    }
    
    // Materiali unici
    if (effect.materials && Array.isArray(effect.materials)) {
      effect.materials.forEach(m => stats.materialsUsed.add(m));
    }
  });
  
  stats.materialCount = stats.materialsUsed.size;
  
  return stats;
}

// Genera timeline di cronologia
function generateTimeline() {
  const timeline = document.getElementById('historyTimeline');
  timeline.innerHTML = ''; // Mantieni solo la linea verticale
  timeline.insertAdjacentHTML('afterbegin', '<div style="position:absolute;top:0;bottom:0;left:10px;width:2px;background:var(--border)"></div>');
  
  // Esempio di eventi di cronologia (in una vera app, questi sarebbero salvati nello stato)
  const history = [
    { date: new Date(), type: 'effect_added', title: 'Aggiunto nuovo effetto' },
    { date: new Date(Date.now() - 86400000), type: 'event_completed', title: 'Show completato' },
    { date: new Date(Date.now() - 86400000 * 3), type: 'routine_created', title: 'Creata nuova routine' },
    { date: new Date(Date.now() - 86400000 * 7), type: 'app_first_use', title: 'Prima apertura app' }
  ];
  
  // Crea elementi timeline
  history.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.style.position = 'relative';
    el.style.marginBottom = index < history.length - 1 ? '24px' : '0';
    
    // Formatta data
    const dateStr = item.date.toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Colore del punto in base al tipo
    let dotColor = 'var(--accent)';
    if (item.type === 'event_completed') dotColor = 'var(--success)';
    if (item.type === 'routine_created') dotColor = 'var(--info)';
    
    el.innerHTML = `
      <div style="position:absolute;top:0;left:-24px;width:20px;height:20px;border-radius:50%;background:${dotColor};border:4px solid var(--surface);box-sizing:border-box"></div>
      <div class="surface-2" style="padding:12px;border-radius:var(--r-l)">
        <div class="cluster" style="justify-content:space-between">
          <strong>${item.title}</strong>
          <small class="meta">${dateStr}</small>
        </div>
      </div>
    `;
    
    timeline.appendChild(el);
  });
}

// Genera grafico categorie
function generateCategoryChart() {
  const stats = calculateStats();
  const chart = document.getElementById('categoryChart');
  chart.innerHTML = '';
  
  // Se non ci sono categorie
  if (Object.keys(stats.categories).length === 0) {
    chart.innerHTML = '<p class="meta" style="text-align:center;width:100%">Nessun dato disponibile</p>';
    return;
  }
  
  // Trova il valore massimo per scalare le barre
  const maxValue = Math.max(...Object.values(stats.categories));
  
  // Crea barre per ogni categoria
  Object.entries(stats.categories).forEach(([category, count]) => {
    const height = Math.max(20, (count / maxValue) * 100); // Altezza minima 20px
    
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.flex = '1';
    bar.style.display = 'flex';
    bar.style.flexDirection = 'column';
    bar.style.alignItems = 'center';
    bar.style.gap = '6px';
    
    bar.innerHTML = `
      <div style="height:${height}px;width:100%;background:var(--accent);border-radius:var(--r-s) var(--r-s) 0 0"></div>
      <small class="meta" style="text-align:center;font-size:10px">${category}</small>
      <small style="font-weight:bold">${count}</small>
    `;
    
    chart.appendChild(bar);
  });
}

function isSectionVisible(key) {
  return localStorage.getItem(key) !== 'off';
}

function toggleHomeSections() {
  const sections = [
    { id: 'sectionUpcoming', key: 'ms.sectionUpcoming' },
    { id: 'sectionRecent', key: 'ms.sectionRecent' },
    { id: 'sectionStats', key: 'ms.sectionStats' },
    { id: 'sectionHistory', key: 'ms.sectionHistory' }
  ];
  sections.forEach(({ id, key }) => {
    $(id).style.display = isSectionVisible(key) ? '' : 'none';
  });
}

function getSortedEvents(state) {
  return [...state.events].sort((a, b) => a.date.localeCompare(b.date));
}

function notifyUpcomingEvents(todayEvents, tomorrowEvents) {
  setTimeout(() => {
    if (todayEvents.length > 0) {
      showToast(`Hai uno show oggi: ${todayEvents[0].title}`, {
        type: 'info',
        duration: 6000,
        action: {
          text: 'Apri',
          callback: () => { window.location.href = 'show/index.html'; }
        }
      });
    } else if (tomorrowEvents.length > 0) {
      showToast(`Show domani: ${tomorrowEvents[0].title}`, {
        type: 'info',
        duration: 5000
      });
    }
  }, 1500);
}

function renderUpcomingEvents(state) {
  const list = $("homeUpcoming");
  list.innerHTML = "";
  const sortedEvents = getSortedEvents(state);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const todayEvents = sortedEvents.filter(event => event.date === todayStr);
  const tomorrowEvents = sortedEvents.filter(event => event.date === tomorrowStr);
  notifyUpcomingEvents(todayEvents, tomorrowEvents);

  sortedEvents.slice(0, 4).forEach(event => {
    const li = document.createElement("li");

    if (event.date === todayStr) {
      li.style.background = "color-mix(in oklab,var(--accent),transparent 85%)";
      li.style.fontWeight = "bold";
    } else if (event.date === tomorrowStr) {
      li.style.background = "color-mix(in oklab,var(--surface),var(--accent) 5%)";
    }

    const note = event.date === todayStr
      ? '<span class="chip" style="background:var(--accent);color:var(--bg)">OGGI</span>'
      : event.date === tomorrowStr
        ? '<span class="chip">DOMANI</span>'
        : '—';

    li.innerHTML = `<span>${event.date}</span><span>${event.title}</span><span>${note}</span>`;
    list.appendChild(li);
  });
}

function renderRecentEffects(state) {
  const recent = $("homeRecent");
  recent.innerHTML = "";

  state.effects.slice(0, 6).forEach((effect, index) => {
    const el = document.createElement("div");
    let cls = "card";
    if (index === 0) cls += " card--wide";
    else if (index === 1) cls += " card--tall";
    el.className = cls;
    el.innerHTML = `
      <div class="center" style="width:56px;height:56px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)">
        <svg class="icon" style="color:var(--accent)"><use href="#ic-book"/></svg>
      </div>
      <h4>${effect.title}</h4>
      <a class="btn btn-secondary" href="effects/details.html?id=${encodeURIComponent(effect.id)}">
        <svg class="icon"><use href="#ic-chevron-right"/></svg> Dettagli
      </a>
      <p class="meta clamp-2">${effect.summary}</p>
      <div class="cluster">
        <span class="chip">${effect.cat}</span>
        <span class="chip">${fmtSec(effect.duration)}</span>
      </div>
    `;
    recent.appendChild(el);
  });
}

// Aggiorna la pagina home
function refreshHome(){
  const state = getState();
  toggleHomeSections();
  renderUpcomingEvents(state);
  renderRecentEffects(state);
}

// Aggiorna statistiche visualizzate
function updateStats() {
  const stats = calculateStats();
  
  // Popola i contatori
  $("statEffects").textContent = stats.effectCount;
  $("statEvents").textContent = stats.eventCount;
  $("statDuration").textContent = fmtSec(stats.totalDuration);
  $("statMaterials").textContent = stats.materialCount;
  
  // Data ultimo aggiornamento
  $("statsDate").textContent = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short'
  });
  
  // Genera grafico categorie
  generateCategoryChart();
  
  // Genera timeline
  generateTimeline();
}

// Inizializza la pagina
refreshHome();
updateStats();

// Event listener per aggiungere eventi
$("addEvent")?.addEventListener("click", showAddEventModal);
