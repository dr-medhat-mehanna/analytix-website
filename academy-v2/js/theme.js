/* Theme Switcher - Dark/Light Mode */
(function() {
  const STORAGE_KEY = 'analytix_theme';
  const LIGHT_CLASS = 'light-mode';
  
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add(LIGHT_CLASS);
      updateToggleIcon('🌙');
    } else {
      document.body.classList.remove(LIGHT_CLASS);
      updateToggleIcon('☀️');
    }
  }
  
  function updateToggleIcon(icon) {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) toggle.textContent = icon;
  }
  
  function getStoredTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }
  
  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }
  
  function toggleTheme() {
    const current = getStoredTheme();
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    applyTheme(getStoredTheme());
    
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }
  });
  
  if (getStoredTheme() === 'light') {
    document.documentElement.classList.add('light-preload');
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add(LIGHT_CLASS);
      document.documentElement.classList.remove('light-preload');
    });
  }
  
  window.AnalytixTheme = { toggle: toggleTheme, set: setTheme, get: getStoredTheme };
})();
