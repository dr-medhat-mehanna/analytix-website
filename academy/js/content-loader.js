document.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');
  const id = urlParams.get('id');
  
  if (!type || !id) { showError('معلمات URL مفقودة'); return; }
  
  try {
    const response = await fetch(`data/standards/${type}/${id}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    loadContent(data);
  } catch (error) {
    console.error('خطأ:', error);
    showError('لم نتمكن من تحميل هذا المحتوى');
  }
});

function renderSection(section) {
  if (section.type === 'heading') {
    const lvl = section.level || 2;
    return `<h${lvl} style="color:#E8C76A;margin:32px 0 16px 0;font-weight:700;">${section.text}</h${lvl}>`;
  }
  if (section.type === 'paragraph') {
    return `<p style="color:#d4d4d4;line-height:1.9;margin:0 0 16px 0;font-size:16px;">${section.text}</p>`;
  }
  if (section.type === 'list') {
    const items = (section.items || []).map(i => `<li style="margin:8px 0;color:#d4d4d4;line-height:1.8;">${i}</li>`).join('');
    return `<ul style="padding-right:24px;margin:16px 0;">${items}</ul>`;
  }
  if (section.type === 'quote' || section.type === 'callout') {
    return `<blockquote style="border-right:4px solid #C9A84C;background:rgba(201,168,76,0.05);padding:16px 20px;margin:20px 0;color:#e8e8e8;border-radius:6px;">${section.text}</blockquote>`;
  }
  return `<p style="color:#d4d4d4;">${section.text || ''}</p>`;
}

function loadContent(data) {
  document.title = `${data.title} | أكاديمية Analytix`;
  
  const titleEl = document.querySelector('.article-title-main');
  if (titleEl) titleEl.textContent = data.title;
  
  const summaryEl = document.querySelector('.article-summary');
  if (summaryEl && data.content.summary) summaryEl.textContent = data.content.summary;
  
  // Render sections
  const contentEl = document.querySelector('.article-content-area');
  if (contentEl && data.content.sections) {
    let html = '';
    data.content.sections.forEach(s => { html += renderSection(s); });
    
    // Add keyTakeaways
    if (data.content.keyTakeaways && data.content.keyTakeaways.length) {
      html += `<div style="margin-top:40px;padding:24px;background:rgba(29,158,117,0.08);border:1px solid rgba(29,158,117,0.3);border-radius:12px;">`;
      html += `<h3 style="color:#1D9E75;margin:0 0 16px 0;">📌 النقاط الرئيسية</h3>`;
      html += `<ul style="padding-right:20px;margin:0;">`;
      data.content.keyTakeaways.forEach(k => { html += `<li style="margin:8px 0;color:#d4d4d4;line-height:1.8;">${k}</li>`; });
      html += `</ul></div>`;
    }
    
    // Add tags
    if (data.tags && data.tags.length) {
      html += `<div style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap;">`;
      data.tags.forEach(t => { html += `<span style="padding:6px 14px;background:rgba(201,168,76,0.1);color:#E8C76A;border-radius:20px;font-size:13px;">#${t}</span>`; });
      html += `</div>`;
    }
    
    contentEl.innerHTML = html;
    contentEl.style.display = 'block';
  }
  
  document.body.classList.add('content-loaded');
  const loadingEl = document.querySelector('.loading-container');
  if (loadingEl) loadingEl.style.display = 'none';
}

function showError(message) {
  const errorHtml = `<div style="text-align:center;padding:60px 20px;"><div style="font-size:48px;margin-bottom:20px;">⚠️</div><h2 style="color:#C9A84C;">المحتوى غير متاح</h2><p style="color:#888;margin:20px 0;">${message}</p><a href="./" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#000;text-decoration:none;border-radius:6px;">العودة للأكاديمية</a></div>`;
  document.body.innerHTML = document.body.innerHTML.replace(/<div class="loading-container">.*?<\/div>/s, errorHtml);
}
