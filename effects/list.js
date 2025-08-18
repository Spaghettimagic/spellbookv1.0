import { initCatalogSearch } from "../assets/js/core/search-ui.js";
import { highlightSearchMatch, searchEffects } from "../assets/js/core/search.js";
import { getState, overwriteEffects } from "../assets/js/core/state.js";
import { $, downloadJSON, importJSON, onKeySlashFocus, wireActiveNav } from "../assets/js/core/utils.js";

wireActiveNav();
onKeySlashFocus("#globalSearch");
initCatalogSearch();

// Setup listeners
$("exportFx")?.addEventListener("click", () => {
  downloadJSON("spellbook-effects.json", getState().effects);
});

$("importFx")?.addEventListener("change", async (e) => {
  try {
    if (!e.target.files.length) return;
    const data = await importJSON(e.target.files[0]);
    if (Array.isArray(data)) {
      overwriteEffects(data);
      refreshCatalog();
    }
  } catch(err) {
    console.error("Import error", err);
    alert("Errore nell'importazione: formato non valido");
  }
});

// Reset filters button
$("resetFilters")?.addEventListener("click", () => {
  const searchInput = $("fxSearch");
  const catFilter = $("fxFilterCat");
  const diffFilter = $("fxFilterDiff");
  const materialFilter = $("fxFilterMaterial");
  
  if (searchInput) searchInput.value = "";
  if (catFilter) catFilter.value = "";
  if (diffFilter) diffFilter.value = "";
  if (materialFilter) materialFilter.value = "";
  
  refreshCatalog();
});

// Search with filters
function refreshCatalog() {
  const searchInput = $("fxSearch");
  const catFilter = $("fxFilterCat");
  const diffFilter = $("fxFilterDiff");
  const materialFilter = $("fxFilterMaterial");
  const resultCount = $("fxResultCount");
  const resultsContainer = $("fxList");
  
  if (!resultsContainer) return;
  
  const query = searchInput ? searchInput.value : "";
  const filters = {
    category: catFilter ? catFilter.value : "",
    difficulty: diffFilter ? diffFilter.value : "",
    material: materialFilter ? materialFilter.value : ""
  };
  
  const results = searchEffects(query, filters);
  
  // Aggiorna conteggio risultati
  if (resultCount) {
    resultCount.textContent = results.length === 0 
      ? "Nessun effetto trovato" 
      : `Trovati ${results.length} effetti`;
  }
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="surface stack" style="grid-column:1/-1;text-align:center;padding:30px 20px">
        <svg class="icon" style="width:40px;height:40px;margin:0 auto;opacity:0.5"><use href="#ic-book"/></svg>
        <h3>Nessun effetto trovato</h3>
        <p class="meta">Prova a modificare i criteri di ricerca</p>
      </div>
    `;
    return;
  }
  
  resultsContainer.innerHTML = results.map(effect => `
    <article class="surface stack">
      <h3 class="h3">${highlightSearchMatch(effect.title, query)}</h3>
      <div class="cluster" style="flex-wrap:wrap">
        <span class="chip">${effect.cat}</span>
        <span class="chip">Difficoltà: ${effect.diff}/5</span>
        <span class="chip">Durata: ${Math.floor(effect.duration/60)}:${String(effect.duration%60).padStart(2,'0')}</span>
      </div>
      <p class="meta clamp-2">${highlightSearchMatch(effect.summary, query)}</p>
      <div class="cluster" style="justify-content:space-between;margin-top:auto">
        <div>
          ${effect.materials ? `<small class="meta">Materials: ${effect.materials.join(', ')}</small>` : ''}
        </div>
        <a href="details.html?id=${encodeURIComponent(effect.id)}" class="btn btn-primary">
          <svg class="icon"><use href="#ic-chevron-right"/></svg> Dettagli
        </a>
      </div>
    </article>
  `).join('');
}

// Inizializzazione
refreshCatalog();