// Advanced Search Module
import { getState } from './state.js';

// Ricerca effetti con più filtri
export function searchEffects(query = '', filters = {}) {
  const state = getState();
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return state.effects.filter(effect => {
    // Applica filtri di ricerca testuale
    if (searchTerms.length > 0 && query) {
      const searchableText = [
        effect.title, 
        effect.summary, 
        effect.cat, 
        effect.method, 
        (effect.materials || []).join(' ')
      ].join(' ').toLowerCase();
      
      const matchesSearch = searchTerms.every(term => searchableText.includes(term));
      if (!matchesSearch) return false;
    }
    
    // Filtra per categoria
    if (filters.category && filters.category !== '' && effect.cat !== filters.category) {
      return false;
    }
    
    // Filtra per difficoltà
    if (filters.difficulty && filters.difficulty !== '' && effect.diff != filters.difficulty) {
      return false;
    }
    
    // Filtra per durata
    if (filters.maxDuration && effect.duration > filters.maxDuration) {
      return false;
    }
    
    // Filtra per materiali
    if (filters.material && filters.material !== '') {
      const hasMaterial = effect.materials && 
        effect.materials.some(m => m.toLowerCase().includes(filters.material.toLowerCase()));
      if (!hasMaterial) return false;
    }
    
    return true;
  });
}

// Evidenzia risultati della ricerca
export function highlightSearchMatch(text, query) {
  if (!query || !text) return text;
  
  const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 2);
  if (!terms.length) return text;
  
  let result = text;
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });
  
  return result;
}

// Ricerca globale in tutte le sezioni
export function globalSearch(query) {
  if (!query) return { effects: [], events: [] };
  
  const state = getState();
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  // Cerca negli effetti
  const effects = state.effects.filter(effect => {
    const searchableText = [
      effect.title, 
      effect.summary, 
      effect.cat, 
      effect.method, 
      (effect.materials || []).join(' ')
    ].join(' ').toLowerCase();
    
    return searchTerms.every(term => searchableText.includes(term));
  });
  
  // Cerca negli eventi
  const events = state.events.filter(event => {
    const searchableText = [
      event.title,
      event.date
    ].join(' ').toLowerCase();
    
    return searchTerms.some(term => searchableText.includes(term));
  });
  
  return { effects, events };
}

// Esporta suggerimenti di ricerca
export function getSuggestions(partialQuery, limit = 5) {
  if (!partialQuery || partialQuery.length < 2) return [];
  
  const state = getState();
  const query = partialQuery.toLowerCase().trim();
  
  // Combina titoli degli effetti e categorie per suggerimenti
  const sources = [
    ...state.effects.map(e => e.title),
    ...Array.from(new Set(state.effects.map(e => e.cat))),
    ...state.effects.flatMap(e => e.materials || [])
  ];
  
  const uniqueSuggestions = Array.from(new Set(sources))
    .filter(s => s && s.toLowerCase().includes(query))
    .slice(0, limit);
    
  return uniqueSuggestions;
}

export default {
  searchEffects,
  highlightSearchMatch,
  globalSearch,
  getSuggestions
};
