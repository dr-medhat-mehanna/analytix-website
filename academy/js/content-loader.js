/* Content Loader - Fixed HTML escaping */
(function() {
  function $(selector) { return document.querySelector(selector); }
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  
  // إزالة HTML escaping للنصوص العربية
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  const renderers = {
    heading: (s) => {
      const level = s.level || 2;
      return `<h${level} class="article-heading level-${level}">${s.text}</h${level}>`;
    },
    paragraph: (s) => `<p class="article-paragraph">${s.text}</p>`,
    list: (s) => {
      const tag = s.style === 'numbered' ? 'ol' : 'ul';
      const className = s.style === 'numbered' ? 'article-ol' : 'article-ul';
      const items = s.items.map(item => `<li>${item}</li>`).join('');
      return `<${tag} class="${className}">${items}</${tag}>`;
    },
    callout: (s) => {
      const variant = s.variant || 'info';
      const icons = { info: '💡', warning: '⚠️', success: '✅', danger: '🚫' };
      return `
        <div class="callout callout-${variant}">
          <div class="callout-icon">${icons[variant] || '💡'}</div>
          <div class="callout-content">
            ${s.title ? `<div class="callout-title">${s.title}</div>` : ''}
            <div class="callout-text">${s.text}</div>
          </div>
        </div>`;
    },
    example: (s) => `
      <div class="example-box">
        <div class="example-label">مثال تطبيقي</div>
        <h4 class="example-title">${s.title}</h4>
        <div class="example-scenario">
          <strong>السيناريو:</strong> ${s.scenario}
        </div>
        <div class="example-solution">
          <strong>الحل:</strong> ${s.solution}
        </div>
      </div>`,
    table: (s) => {
      const thead = `<tr>${s.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
      const tbody = s.rows.map(row => 
        `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
      ).join('');
      return `<div class="table-wrapper"><table class="article-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
    },
    code: (s) => `<pre class="code-block"><code>${escapeHtml(s.text)}</code></pre>`
  };
  
  function renderSections(sections) {
    return sections.map(section => {
      const renderer = renderers[section.type];
      return renderer ? renderer(section) : '';
    }).join('');
  }
  
  async function loadContent(type, id) {
    const path = getJsonPath(type, id);
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderPage(data);
    } catch (err) {
      console.error('Failed to load content:', err);
      renderError(err);
    }
  }
  
  function getJsonPath(type, id) {
    const typePaths = {
      'ias': 'data/standards/ias',
      'ifrs': 'data/standards/ifrs',
      'sox': 'data/standards/sox',
      'coso': 'data/standards/coso',
      'standard': 'data/standards/ias',
      'task': 'data/cfo-tasks',
      'article': 'data/articles',
      'book': 'data/books',
      'control': 'data/internal-controls'
    };
    const base = typePaths[type] || typePaths['article'];
    return `${base}/${id}.json`;
  }
  
  function renderPage(data) {
    document.title = `${data.title} | أكاديمية Analytix`;
    
    const metaDesc = $('meta[name="description"]');
    if (metaDesc && data.meta?.description) {
      metaDesc.setAttribute('content', data.meta.description);
    }
    
    setContent('.article-category', getCategoryBadge(data.category));
    setContent('.article-title-main', data.title);
    setContent('.article-subtitle', data.titleEn || '');
    setContent('.article-reading-time', data.readingTime);
    setContent('.article-updated', `آخر تحديث: ${formatDate(data.updatedDate)}`);
    setContent('.article-summary', data.content.summary);
    
    const sectionsContainer = $('.article-sections');
    if (sectionsContainer) {
      sectionsContainer.innerHTML = renderSections(data.content.sections);
    }
    
    const takeawaysContainer = $('.article-takeaways');
    if (takeawaysContainer && data.content.keyTakeaways) {
      takeawaysContainer.innerHTML = `
        <h3>📌 نقاط رئيسية</h3>
        <ul>${data.content.keyTakeaways.map(t => `<li>${t}</li>`).join('')}</ul>`;
    }
    
    const relatedContainer = $('.article-related');
    if (relatedContainer && data.content.relatedContent) {
      relatedContainer.innerHTML = `
        <h3>🔗 محتوى ذو صلة</h3>
        <div class="related-grid">
          ${data.content.relatedContent.map(r => `
            <a href="article.html?type=${r.type}&id=${r.id}" class="related-card">
              <div class="related-title">${r.title}</div>
              <div class="related-arrow">←</div>
            </a>`).join('')}
        </div>`;
    }
    
    const tagsContainer = $('.article-tags');
    if (tagsContainer && data.tags) {
      tagsContainer.innerHTML = data.tags.map(t => 
        `<span class="tag-chip">${t}</span>`
      ).join('');
    }
    
    const pdfBtn = $('.pdf-download-btn');
    if (pdfBtn && data.pdf?.available) {
      pdfBtn.addEventListener('click', () => generatePDF(data));
    }
    
    document.body.classList.add('content-loaded');
  }
  
  function renderError(err) {
    const container = $('.article-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px;">
          <h2>⚠️ المحتوى غير متاح</h2>
          <p style="color: var(--text-muted); margin: 16px 0;">
            لم نتمكن من تحميل هذا المحتوى. قد يكون غير منشور بعد.
          </p>
          <a href="./" class="cta-btn">العودة للأكاديمية</a>
        </div>`;
    }
  }
  
  function setContent(selector, content) {
    const el = $(selector);
    if (el) el.textContent = content;
  }
  
  function getCategoryBadge(cat) {
    const badges = {
      'ias': 'IAS — المحاسبة الدولية',
      'ifrs': 'IFRS — التقارير المالية',
      'sox': 'SOX — ساربينز أوكسلي',
      'coso': 'COSO — الرقابة الداخلية',
      'cfo-tasks': 'مهام المدير المالي',
      'articles': 'مقال',
      'books': 'ملخص كتاب'
    };
    return badges[cat] || cat;
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
// إصلاح مباشر لوظيفة PDF
function generatePDF(data) {
  // توليد PDF مباشر بدون dependencies خارجية
  const printContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${data.title} | أكاديمية Analytix</title>
<style>
@page { size: A4; margin: 2cm; }
body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 20px; }
.header { text-align: center; border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
.header h1 { color: #D4AF37; font-size: 24px; margin: 0; }
.title-section { background: linear-gradient(135deg, #D4AF37, #F59E0B); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
.title-section h2 { margin: 0 0 10px 0; font-size: 22px; }
.summary { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; margin: 20px 0; border-radius: 6px; }
.key-points { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 6px; }
.footer { position: fixed; bottom: 1cm; left: 0; right: 0; text-align: center; font-size: 11px; color: #999; }
@media print { body { print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>أكاديمية Analytix</h1>
  <p>المرجع الشامل للمعايير المحاسبية والمالية</p>
  <p style="font-size: 12px; color: #666;">${new Date().toLocaleDateString('ar-EG')}</p>
</div>

<div class="title-section">
  <h2>${data.title}</h2>
  <p style="margin: 0; font-size: 14px;">${data.titleEn || ''}</p>
</div>

<div class="summary">
  <h3 style="color: #1E293B; margin-top: 0;">📋 ملخص المعيار</h3>
  <p>${data.content?.summary || 'غير متاح'}</p>
</div>

${data.content?.keyTakeaways ? `
<div class="key-points">
  <h3 style="color: #1E293B; margin-top: 0;">📌 النقاط الرئيسية</h3>
  <ul style="margin: 10px 0; padding-right: 20px;">
    ${data.content.keyTakeaways.map(point => `<li style="margin-bottom: 8px;">${point}</li>`).join('')}
  </ul>
</div>
` : ''}

<div class="footer">
  <p>© ${new Date().getFullYear()} أكاديمية Analytix | https://analytix.finance/academy</p>
</div>

</body>
</html>`;

  // فتح نافذة طباعة
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  };
}
