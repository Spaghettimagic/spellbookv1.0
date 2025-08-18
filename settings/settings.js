import { initGlobalSearch } from "../assets/js/core/search-ui.js";
import { getState, setProtect, setTheme } from "../assets/js/core/state.js";
import { $, downloadJSON, importJSON, onKeySlashFocus, wireActiveNav } from "../assets/js/core/utils.js";

wireActiveNav();
onKeySlashFocus("#globalSearch");
initGlobalSearch();

// Inizializza impostazioni da file JSON se non presenti
(async () => {
  if (!localStorage.getItem('ms.settings')) {
    try {
      const defaults = await fetch('./defaults.json').then(r => r.json());
      localStorage.setItem('ms.settings', JSON.stringify(defaults));
      Object.entries(defaults).forEach(([k, v]) => {
        localStorage.setItem(`ms.${k}`, v);
      });
    } catch (err) {
      console.error('Impossibile caricare defaults', err);
    }
  }
})();

// Gestione tema
const themeSelect = $("setTheme");
themeSelect.value = getState().theme;
themeSelect.addEventListener("change", () => {
  setTheme(themeSelect.value);

  // Aggiorna i pulsanti del tema
  document.querySelectorAll('.themeBtn').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.theme === themeSelect.value ? 'true' : 'false');
  });
});

// Gestione protezione
const protectSelect = $("setProtect");
protectSelect.value = getState().protect;
protectSelect.addEventListener("change", () => {
  setProtect(protectSelect.value);
});

// Gestione colori
document.querySelectorAll('.color-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    setAccentColor(btn.dataset.color);
  });
});

// Gestione dimensione testo
const fontSizeRange = $("setFontSize");
const storedFontSize = localStorage.getItem('ms.fontSize') || '100';
fontSizeRange.value = storedFontSize;
applyFontSize(storedFontSize);

fontSizeRange.addEventListener("input", () => {
  const fontSize = fontSizeRange.value;
  localStorage.setItem('ms.fontSize', fontSize);
  applyFontSize(fontSize);
});

// Offline mode
const offlineModeSelect = $("setOfflineMode");
offlineModeSelect.value = localStorage.getItem('ms.offline') || 'on';
offlineModeSelect.addEventListener("change", () => {
  localStorage.setItem('ms.offline', offlineModeSelect.value);
});

// Notifiche
const notificationsSelect = $("setNotifications");
notificationsSelect.value = localStorage.getItem('ms.notifications') || 'on';
notificationsSelect.addEventListener("change", () => {
  localStorage.setItem('ms.notifications', notificationsSelect.value);
  
  // Richiedi permesso per le notifiche se attivate
  if (notificationsSelect.value === 'on' && 'Notification' in window) {
    Notification.requestPermission();
  }
});

// Script protection
const scriptProtectionSelect = $("setShowOnlyInPractice");
scriptProtectionSelect.value = localStorage.getItem('ms.scriptProtection') || 'on';
scriptProtectionSelect.addEventListener("change", () => {
  localStorage.setItem('ms.scriptProtection', scriptProtectionSelect.value);
});

// Sezioni Home
const sectionToggles = [
  { id: 'trackShows', key: 'trackShows' },
  { id: 'toggleUpcoming', key: 'sectionUpcoming' },
  { id: 'toggleRecent', key: 'sectionRecent' },
  { id: 'toggleStats', key: 'sectionStats' },
  { id: 'toggleHistory', key: 'sectionHistory' }
];

sectionToggles.forEach(({ id, key }) => {
  const el = $(id);
  if (!el) return;
  const stored = localStorage.getItem(`ms.${key}`);
  el.checked = stored !== 'off';
  el.addEventListener('change', () => {
    localStorage.setItem(`ms.${key}`, el.checked ? 'on' : 'off');
  });
});

function collectSettings() {
  return {
    theme: localStorage.getItem('ms.theme') || 'dark',
    protect: localStorage.getItem('ms.protect') || 'on',
    fontSize: localStorage.getItem('ms.fontSize') || '100',
    accent: localStorage.getItem('ms.accent') || '#C6A664',
    offline: localStorage.getItem('ms.offline') || 'on',
    notifications: localStorage.getItem('ms.notifications') || 'on',
    scriptProtection: localStorage.getItem('ms.scriptProtection') || 'on',
    sectionUpcoming: localStorage.getItem('ms.sectionUpcoming') || 'on',
    sectionRecent: localStorage.getItem('ms.sectionRecent') || 'on',
    sectionStats: localStorage.getItem('ms.sectionStats') || 'on',
    sectionHistory: localStorage.getItem('ms.sectionHistory') || 'on',
    trackShows: localStorage.getItem('ms.trackShows') || 'on'
  };
}

$("btnSaveSettings")?.addEventListener("click", () => {
  const settings = collectSettings();
  localStorage.setItem('ms.settings', JSON.stringify(settings));
  downloadJSON('settings.json', settings);
  alert('Impostazioni salvate');
});

// Backup dati
$("btnBackupData")?.addEventListener("click", () => {
  const allData = {
    state: getState(),
    settings: {
      fontSize: localStorage.getItem('ms.fontSize'),
      accent: localStorage.getItem('ms.accent'),
      offline: localStorage.getItem('ms.offline'),
      notifications: localStorage.getItem('ms.notifications'),
      scriptProtection: localStorage.getItem('ms.scriptProtection')
    }
  };
  
  downloadJSON("spellbook-backup.json", allData);
});

// Importazione dati
$("importData")?.addEventListener("change", async (e) => {
  try {
    if (!e.target.files.length) return;
    const data = await importJSON(e.target.files[0]);
    
    if (data && data.state) {
      localStorage.setItem('spellbook.state.v4', JSON.stringify(data.state));
    }
    
    if (data && data.settings) {
      const settings = data.settings;
      if (settings.fontSize) localStorage.setItem('ms.fontSize', settings.fontSize);
      if (settings.accent) localStorage.setItem('ms.accent', settings.accent);
      if (settings.offline) localStorage.setItem('ms.offline', settings.offline);
      if (settings.notifications) localStorage.setItem('ms.notifications', settings.notifications);
      if (settings.scriptProtection) localStorage.setItem('ms.scriptProtection', settings.scriptProtection);
    }
    
    alert('Impostazioni importate con successo. Ricarica la pagina.');
    setTimeout(() => location.reload(), 500);
  } catch(err) {
    console.error("Import error", err);
    alert("Errore nell'importazione: formato non valido");
  }
});

// Clear cache
$("btnClearCache")?.addEventListener("click", () => {
  if (confirm('Vuoi davvero cancellare la cache?')) {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    alert('Cache cancellata');
  }
});

// Reset impostazioni
$("btnResetSettings")?.addEventListener("click", () => {
  if (confirm('Vuoi davvero resettare le impostazioni?')) {
    localStorage.removeItem('ms.theme');
    localStorage.removeItem('ms.fontSize');
    localStorage.removeItem('ms.accent');
    localStorage.removeItem('ms.offline');
    localStorage.removeItem('ms.notifications');
    localStorage.removeItem('ms.scriptProtection');
    
    alert('Impostazioni resettate. Ricarica la pagina.');
    setTimeout(() => location.reload(), 500);
  }
});

// Reset completo
$("btnResetAll")?.addEventListener("click", () => {
  if (confirm('ATTENZIONE: Stai per cancellare tutti i dati dell\'app. Questa azione non può essere annullata. Continuare?')) {
    localStorage.clear();
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    alert('Tutti i dati sono stati cancellati. L\'app verrà riavviata.');
    setTimeout(() => location.href = '../index.html', 500);
  }
});

// Calcola storage utilizzato
function calculateStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    total += key.length + value.length;
  }
  
  // Converti in KB
  const kb = (total / 1024).toFixed(2);
  $("storageUsed").textContent = `${kb} KB`;
}

// Applica dimensione del testo
function applyFontSize(value) {
  document.documentElement.style.setProperty('--fontSize-scale', `${value}%`);
}

// Imposta colore principale
function setAccentColor(color) {
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem('ms.accent', color);
}

// Inizializza colore accent
const storedAccentColor = localStorage.getItem('ms.accent');
if (storedAccentColor) {
  setAccentColor(storedAccentColor);
  document.querySelectorAll('.color-option').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.color === storedAccentColor ? 'true' : 'false');
  });
}

// Calcola storage usato
calculateStorageUsage();