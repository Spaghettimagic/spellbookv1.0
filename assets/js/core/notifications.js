// Sistema di notifiche per Spellbook
import { getState } from './state.js';

// Controlla se il browser supporta le notifiche
export function canUseNotifications() {
  return 'Notification' in window;
}

// Richiede il permesso per inviare notifiche
export async function requestNotificationPermission() {
  if (!canUseNotifications()) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Errore nella richiesta di permesso per le notifiche:', error);
    return false;
  }
}

// Controlla se le notifiche sono attivate nelle impostazioni dell'app
export function areNotificationsEnabled() {
  return localStorage.getItem('ms.notifications') === 'on';
}

// Invia una notifica
export function sendNotification(title, options = {}) {
  if (!canUseNotifications() || !areNotificationsEnabled()) return null;
  
  if (Notification.permission === 'granted') {
    const defaultOptions = {
      icon: '../assets/img/favicon.svg',
      badge: '../assets/img/favicon.svg',
      vibrate: [100, 50, 100],
      silent: false
    };
    
    return new Notification(title, { ...defaultOptions, ...options });
  } else {
    requestNotificationPermission();
    return null;
  }
}

// Controlla eventi imminenti e invia notifiche se necessario
export function checkUpcomingEvents() {
  if (!canUseNotifications() || !areNotificationsEnabled()) return;
  
  const state = getState();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizza alla mezzanotte
  
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  
  // Trova eventi per oggi e domani
  const todayEvents = state.events.filter(event => event.date === todayStr);
  const tomorrowEvents = state.events.filter(event => event.date === tomorrowStr);
  
  // Notifica eventi di oggi
  if (todayEvents.length > 0) {
    sendNotification(`Show oggi: ${todayEvents[0].title}`, {
      body: `Hai ${todayEvents.length} eventi programmati per oggi.`,
      data: { type: 'event', date: todayStr },
      tag: 'today-events'
    });
  }
  
  // Notifica eventi di domani
  if (tomorrowEvents.length > 0) {
    sendNotification(`Promemoria: Show domani`, {
      body: `Hai ${tomorrowEvents.length} eventi programmati per domani.`,
      data: { type: 'event', date: tomorrowStr },
      tag: 'tomorrow-events'
    });
  }
}

// Inizializza il sistema di notifiche
export function initNotificationSystem() {
  if (areNotificationsEnabled() && canUseNotifications()) {
    // Richiedi il permesso se necessario
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      requestNotificationPermission();
    }
    
    // Controlla eventi all'avvio
    setTimeout(() => checkUpcomingEvents(), 2000);
    
    // Imposta controllo periodico degli eventi
    const checkInterval = 3 * 60 * 60 * 1000; // Ogni 3 ore
    setInterval(checkUpcomingEvents, checkInterval);
    
    return true;
  }
  
  return false;
}

// Sistema di toast per notifiche in-app
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
toastContainer.style.position = 'fixed';
toastContainer.style.bottom = '70px';
toastContainer.style.right = '20px';
toastContainer.style.zIndex = '9999';

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(toastContainer);
});

// Mostra una notifica toast in-app
export function showToast(message, options = {}) {
  const { type = 'info', duration = 4000, action } = options;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.style.background = 'var(--surface)';
  toast.style.color = 'var(--text)';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = 'var(--r-m)';
  toast.style.marginTop = '10px';
  toast.style.boxShadow = 'var(--e3)';
  toast.style.maxWidth = '320px';
  toast.style.minWidth = '260px';
  toast.style.transform = 'translateX(120%)';
  toast.style.transition = 'transform 0.3s var(--ease)';
  toast.style.borderLeft = '4px solid var(--accent)';
  
  if (type === 'success') toast.style.borderLeftColor = 'var(--success)';
  if (type === 'warning') toast.style.borderLeftColor = 'var(--warning)';
  if (type === 'error') toast.style.borderLeftColor = 'var(--error)';
  
  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.justifyContent = 'space-between';
  content.style.alignItems = 'center';
  
  const messageEl = document.createElement('span');
  messageEl.textContent = message;
  content.appendChild(messageEl);
  
  if (action) {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary';
    button.style.marginLeft = '12px';
    button.style.padding = '6px 10px';
    button.style.minHeight = '32px';
    button.textContent = action.text;
    button.addEventListener('click', () => {
      action.callback();
      removeToast();
    });
    content.appendChild(button);
  }
  
  toast.appendChild(content);
  toastContainer.appendChild(toast);
  
  // Forza il reflow per applicare la transizione
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  const removeToast = () => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  };
  
  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
  
  return { close: removeToast };
}

export default {
  canUseNotifications,
  requestNotificationPermission,
  areNotificationsEnabled,
  sendNotification,
  checkUpcomingEvents,
  initNotificationSystem,
  showToast
};
