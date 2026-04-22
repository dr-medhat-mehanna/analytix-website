/* Theme Switcher - Unified across site */
(function() {
  // استخدام نفس الـ key في كل الموقع
  const STORAGE_KEY = 'analytix_site_theme';
  const LIGHT_CLASS = 'light-mode';
  
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add(LIGHT_CLASS);
      document.documentElement.classList.add(LIGHT_CLASS);
      updateToggleIcon('🌙');
    } else {
      document.body.classList.remove(LIGHT_CLASS);
      document.documentElement.classList.remove(LIGHT_CLASS);
      updateToggleIcon('☀️');
    }
    
    // تطبيق على كل الـ iframes لو موجودة
    try {
      window.parent.postMessage({type: 'theme_change', theme: theme}, '*');
    } catch(e) {}
  }
  
  function updateToggleIcon(icon) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
      if (toggle) toggle.textContent = icon;
    });
  }
  
  function getStoredTheme() {
    // جرب الـ key الجديد الأول، ثم القديم
    return localStorage.getItem(STORAGE_KEY) || 
           localStorage.getItem('analytix_theme') || 
           'dark';
  }
  
  function setTheme(theme) {
    // احفظ في الـ key الجديد والقديم عشان التوافق
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem('analytix_theme', theme);
    
    // أرسل للـ main site لو في إطار
    try {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'academy_theme_sync', 
          theme: theme
        }, 'https://analytix.finance');
      }
    } catch(e) {}
    
    applyTheme(theme);
  }
  
  function toggleTheme() {
    const current = getStoredTheme();
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  }
  
  // استقبال تغييرات من صفحات أخرى
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'theme_sync') {
      const newTheme = event.data.theme;
      localStorage.setItem(STORAGE_KEY, newTheme);
      localStorage.setItem('analytix_theme', newTheme);
      applyTheme(newTheme);
    }
  });
  
  // تطبيق فوري قبل DOMContentLoaded
  const initialTheme = getStoredTheme();
  if (initialTheme === 'light') {
    document.documentElement.classList.add('light-preload');
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    applyTheme(initialTheme);
    
    // ربط كل الأزرار
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', toggleTheme);
    });
    
    // إزالة preload class
    document.documentElement.classList.remove('light-preload');
  });
  
  // API عام
  window.AnalytixTheme = { 
    toggle: toggleTheme, 
    set: setTheme, 
    get: getStoredTheme,
    sync: function(theme) {
      setTheme(theme);
    }
  };
})();
