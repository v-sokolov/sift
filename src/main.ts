// App entry: mount the Svelte UI and wire boot-time persistence + language.
import { mount } from 'svelte';
import './styles/app.css';
import App from './App.svelte';
import {
  emptyDilemma,
  getState,
  initLang,
  setLastSaved,
  setState,
  subscribePersist,
} from './store.svelte';
import { detectLang } from './i18n';
import { installUnloadFlush, isLang, load, scheduleSave } from './persistence';
import { applyTheme } from './theme';

const target = document.getElementById('app');
if (!target) throw new Error('Missing #app root element');

// Keep the explicit data-theme live when the OS preference flips while the stored theme is
// 'system' (012, FR-006). Installed once at boot; applyTheme re-resolves from current state.
if (typeof matchMedia === 'function') {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    applyTheme(getState().view.theme);
  });
}

// Persistence channel: debounce-save on every content/view mutation; flush on unload.
subscribePersist((state) => scheduleSave(state, setLastSaved));
installUnloadFlush(getState, setLastSaved);

// Restore prior work (with its saved language), or start from the empty default with a
// browser-detected language (FR-002/FR-004). initLang is render-only (no premature save).
const restored = load();
const navLang = detectLang(navigator.language);
if (restored) {
  const storedLang = (restored.view as unknown as Record<string, unknown>).lang;
  const lang = isLang(storedLang) ? storedLang : navLang;
  setState({
    ...emptyDilemma(),
    dilemma: restored.dilemma,
    view: { ...restored.view, lang },
  });
} else {
  initLang(navLang);
}

mount(App, { target });
