document.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const id = urlParams.get('id');
  
  if (!type || !id) {
    showError('معلمات URL مفقودة');
    return;
  }
  
  try {
    const response = await fetch(`data/${type}/${id}.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    loadContent(data);
  } catch (error) {
    console.error('خطأ في تحميل المحتوى:', error);
    showError('لم نتمكن من تحميل هذا المحتوى');
  }
});

function loadContent(data) {
  document.title = `${data.title} | أكاديمية Analytix`;
  
  // تحميل العنوان
  const titleElement = document.querySelector('.article-title-main');
  if (titleElement) titleElement.textContent = data.title;
  
  // تحميل الملخص
  const summaryElement = document.querySelector('.article-summary');
  if (summaryElement && data.content.summary) {
    summaryElement.textContent = data.content.summary;
  }
  
  // إخفاء Loading
  document.body.classList.add('content-loaded');
  const loadingElement = document.querySelector('.loading-container');
  if (loadingElement) loadingElement.style.display = 'none';
  
  const contentElement = document.querySelector('.article-content-area');
  if (contentElement) contentElement.style.display = 'block';
}

function showError(message) {
  const errorHtml = `
    <div style="text-align: center; padding: 60px 20px;">
      <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
      <h2 style="color: var(--accent); margin-bottom: 10px;">المحتوى غير متاح</h2>
      <p style="color: var(--text-muted); margin-bottom: 30px;">${message}</p>
      <a href="./" style="display: inline-block; padding: 12px 24px; background: var(--accent); color: white; text-decoration: none; border-radius: 6px;">العودة للأكاديمية</a>
    </div>
  `;
  
  document.body.innerHTML = document.body.innerHTML.replace(
    /<div class="loading-container">.*?<\/div>/s, 
    errorHtml
  );
}
