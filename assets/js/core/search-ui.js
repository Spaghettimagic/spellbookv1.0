// Modulo UI per la ricerca
import { getSuggestions, highlightSearchMatch, searchEffects } from './search.js';
import { $, qs, qsa } from './utils.js';

let searchTimeoutId = null;
let suggestionsList = null;
let activeSearchField = null;
let currentSuggestionIndex = -1;

// Inizializza la ricerca globale
export function initGlobalSearch() {
  const searchInput = qs('#globalSearch');
  if (!searchInput) return;
  
  // Crea contenitore suggerimenti
  createSuggestionsContainer();
  
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('focus', e => {
    activeSearchField = e.target;
    showSuggestions(e.target);
  });
  searchInput.addEventListener('blur', e => {
    // Piccolo timeout per permettere il click sui suggerimenti
    setTimeout(() => hideSuggestions(), 150);
  });
  searchInput.addEventListener('keydown', handleSearchKeydown);
}

// Inizializza la ricerca degli effetti
export function initCatalogSearch() {
  const searchInput = qs('#fxSearch');
  const catFilter = qs('#fxFilterCat');
  const diffFilter = qs('#fxFilterDiff');
  
  if (!searchInput || !catFilter || !diffFilter) return;
  
  createSuggestionsContainer();
  
  // Gestisci input di ricerca
  searchInput.addEventListener('input', () => {
    performSearch(searchInput.value, {
      category: catFilter.value,
      difficulty: diffFilter.value
    });
  });
  
  searchInput.addEventListener('focus', e => {
    activeSearchField = e.target;
    showSuggestions(e.target);
  });
  
  searchInput.addEventListener('blur', e => {
    setTimeout(() => hideSuggestions(), 150);
  });
  
  searchInput.addEventListener('keydown', handleSearchKeydown);
  
  // Gestisci filtri
  catFilter.addEventListener('change', () => {
    performSearch(searchInput.value, {
      category: catFilter.value,
      difficulty: diffFilter.value
    });
  });
  
  diffFilter.addEventListener('change', () => {
    performSearch(searchInput.value, {
      category: catFilter.value,
      difficulty: diffFilter.value
    });
  });
  
  // Esegui ricerca iniziale
  performSearch('', {
    category: catFilter.value,
    difficulty: diffFilter.value
  });
}

// Esegui ricerca con debounce
function handleSearchInput(e) {
  const query = e.target.value;
  
  // Clear any existing timeout
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }
  
  // Mostra suggerimenti con breve debounce
  searchTimeoutId = setTimeout(() => {
    showSuggestions(e.target);
  }, 150);
}

// Gestisci navigazione con tastiera
function handleSearchKeydown(e) {
  if (!suggestionsList || suggestionsList.classList.contains('hidden')) {
    return;
  }
  
  const suggestions = qsa('li', suggestionsList);
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
      highlightSuggestion();
      break;
      
    case 'ArrowUp':
      e.preventDefault();
      currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
      highlightSuggestion();
      break;
      
    case 'Enter':
      if (currentSuggestionIndex >= 0 && currentSuggestionIndex < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[currentSuggestionIndex].textContent);
      }
      hideSuggestions();
      break;
      
    case 'Escape':
      e.preventDefault();
      hideSuggestions();
      break;
  }
}

// Crea contenitore per i suggerimenti
function createSuggestionsContainer() {
  if (suggestionsList) return;
  
  suggestionsList = document.createElement('ul');
  suggestionsList.className = 'search-suggestions hidden';
  document.body.appendChild(suggestionsList);
  
  // Gestisci click sui suggerimenti
  suggestionsList.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (li) {
      selectSuggestion(li.textContent);
    }
  });
}

// Mostra suggerimenti
function showSuggestions(inputField) {
  if (!inputField || !suggestionsList) return;
  
  const query = inputField.value.trim();
  if (query.length < 2) {
    hideSuggestions();
    return;
  }
  
  const suggestions = getSuggestions(query);
  
  if (!suggestions.length) {
    hideSuggestions();
    return;
  }
  
  // Posiziona il contenitore dei suggerimenti
  const rect = inputField.getBoundingClientRect();
  suggestionsList.style.top = `${rect.bottom + window.scrollY}px`;
  suggestionsList.style.left = `${rect.left + window.scrollX}px`;
  suggestionsList.style.width = `${rect.width}px`;
  
  // Popola i suggerimenti
  suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
  suggestionsList.classList.remove('hidden');
  
  // Reset indice corrente
  currentSuggestionIndex = -1;
}

// Nascondi suggerimenti
function hideSuggestions() {
  if (suggestionsList) {
    suggestionsList.classList.add('hidden');
  }
  currentSuggestionIndex = -1;
}

// Evidenzia suggerimento selezionato
function highlightSuggestion() {
  const suggestions = qsa('li', suggestionsList);
  
  suggestions.forEach((li, index) => {
    if (index === currentSuggestionIndex) {
      li.classList.add('selected');
    } else {
      li.classList.remove('selected');
    }
  });
  
  if (currentSuggestionIndex >= 0) {
    const selected = suggestions[currentSuggestionIndex];
    selected.scrollIntoView({ block: 'nearest' });
  }
}

// Seleziona un suggerimento
function selectSuggestion(suggestion) {
  if (activeSearchField) {
    activeSearchField.value = suggestion;
    activeSearchField.dispatchEvent(new Event('input'));
  }
}

// Esegui ricerca negli effetti
function performSearch(query, filters) {
  const resultsContainer = $('fxList');
  if (!resultsContainer) return;
  
  const results = searchEffects(query, filters);
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<p class="meta" style="grid-column: 1/-1; text-align: center; padding: 20px;">Nessun effetto trovato.</p>';
    return;
  }
  
  resultsContainer.innerHTML = results.map(effect => `
    <article class="surface stack">
      <h3 class="h3">${highlightSearchMatch(effect.title, query)}</h3>
      <div class="cluster">
        <span class="chip">${effect.cat}</span>
        <span class="chip">Diff: ${effect.diff}/5</span>
        <span class="chip">${effect.duration}s</span>
      </div>
      <p class="meta clamp-2">${highlightSearchMatch(effect.summary, query)}</p>
      <a href="details.html?id=${encodeURIComponent(effect.id)}" class="btn btn-primary">Dettagli</a>
    </article>
  `).join('');
}

export default {
  initGlobalSearch,
  initCatalogSearch
};
