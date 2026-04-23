/* Content Loader - Clean Version */
(function() {
  function $(selector) { return document.querySelector(selector); }
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  
  const renderers = {
    heading: (s) => `<h${s.level || 2} class="article-heading">${s.text}</h${s.level || 2}>`,
    paragraph: (s) => `<p class="article-paragraph">${s.text}</p>`,
    list: (s) => {
      const tag = s.style === 'numbered' ? 'ol' : 'ul';
      const items = s.items.map(item => `<li>${item}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    },
    callout: (s) => {
      const icons = { info: '💡', warning: '⚠️', success: '✅', danger: '🚫' };
      return `<div class="callout callout-${s.variant || 'info'}">
        <div class="callout-icon">${icons[s.variant] || '💡'}</div>
        <div class="callout-content">
          ${s.title ? `<div class="callout-title">${s.title}</div>` : ''}
          <div class="callout-text">${s.text}</div>
        </div>
      </div>`;
    },
    example: (s) => `<div class="example-box">
      <div class="example-label">مثال تطبيقي</div>
      <h4 class="example-title">${s.title}</h4>
      <div class="example-scenario"><strong>السيناريو:</strong> ${s.scenario}</div>
      <div class="example-solution"><strong>الحل:</strong> ${s.solution}</div>
    </div>`
  };
  
  function renderSections(sections) {
    return sections.map(section => {
      const renderer = renderers[section.type];
      return renderer ? renderer(section) : '';
    }).join('');
  }
  
  async function loadContent(type, id) {
    const path = `data/standards/${type}/${id}.json`;
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
  
  function renderPage(data) {
    document.title = `${data.title} | أكاديمية Analytix`;
    
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
    
    // إعداد زر PDF
    const pdfBtn = $('.pdf-download-btn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => generatePDF(data));
    }
    
    document.body.classList.add('content-loaded');
  }
  
  function generatePDF(data) {
    const printContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${data.title} | أكاديمية Analytix</title>
<style>
@page { size: A4; margin: 2cm; }
body { font-family: Arial; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 20px; }
.header { text-align: center; border-bottom: 3px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
.header h1 { color: #D4AF37; font-size: 24px; margin: 0; }
.title { background: #D4AF37; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
.summary { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 6px; }
.key-points { background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 6px; }
@media print { body { print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>أكاديمية Analytix</h1>
  <p>المرجع الشامل للمعايير المحاسبية والمالية</p>
</div>
<div class="title">
  <h2>${data.title}</h2>
  <p>${data.titleEn || ''}</p>
</div>
<div class="summary">
  <h3>📋 ملخص المعيار</h3>
  <p>${data.content?.summary || ''}</p>
</div>
${data.content?.keyTakeaways ? `<div class="key-points">
  <h3>📌 النقاط الرئيسية</h3>
  <ul>${data.content.keyTakeaways.map(p => `<li>${p}</li>`).join('')}</ul>
</div>` : ''}
<footer style="position: fixed; bottom: 1cm; text-align: center; font-size: 11px; color: #999;">
© ${new Date().getFullYear()} أكاديمية Analytix | https://analytix.finance/academy
</footer>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 1000);
  }
  
  function renderError(err) {
    const container = $('.article-container');
    if (container) {
      container.innerHTML = `<div style="text-align: center; padding: 80px 20px;">
        <h2>⚠️ المحتوى غير متاح</h2>
        <p>لم نتمكن من تحميل هذا المحتوى.</p>
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
      'coso': 'COSO — الرقابة الداخلية'
    };
    return badges[cat] || cat;
  }
  
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const type = getQueryParam('type');
    const id = getQueryParam('id');
    if (type && id) {
      loadContent(type, id);
    }
  });
})();

function updateAuthorSection(data) {
  const authorSection = document.querySelector('.article-author');
  if (!authorSection) return;
  
  if (data.author === 'مدحت مهنا') {
    // توقيع مدحت مهنا الاحترافي
    authorSection.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="width: 70px; height: 70px; background: linear-gradient(135deg, var(--accent), #F59E0B); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">م</div>
        <div>
          <div style="font-weight: 800; font-size: 19px; margin-bottom: 6px; color: var(--accent);">
            <span style="font-family: 'Tajawal', serif; letter-spacing: 0.5px;">مدحت مهنا</span>
            <div style="width: 100%; height: 2px; background: linear-gradient(90deg, var(--accent), transparent); margin-top: 2px; opacity: 0.6;"></div>
          </div>
          <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">مؤسس ومطور منصة Analytix</div>
          <div style="color: var(--text-muted); font-size: 13px;">خبير التحليل المالي والتكنولوجيا المالية | 12+ عاماً خبرة</div>
        </div>
      </div>`;
  } else {
    // فريق العمل العادي
    authorSection.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="width: 60px; height: 60px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">A</div>
        <div>
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">فريق منصة Analytix</div>
          <div style="font-weight: 500; color: var(--text-muted); font-size: 13px;">متخصصون في المعايير المحاسبية والتحليل المالي</div>
        </div>
      </div>`;
  }
}
