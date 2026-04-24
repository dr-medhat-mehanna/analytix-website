(function() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');
  if (!type || !id) { showError('رابط غير صحيح'); return; }
  const pathMap = {
    ias: `data/standards/ias/${id}.json`,
    ifrs: `data/standards/ifrs/${id}.json`,
    sox: `data/standards/sox/${id}.json`,
    coso: `data/standards/coso/${id}.json`,
    cfo: `data/cfo-tasks/${id}.json`,
    controls: `data/internal-controls/${id}.json`
  };
  const jsonPath = pathMap[type];
  if (!jsonPath) { showError('نوع المحتوى غير معروف'); return; }
  fetch(jsonPath)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => renderArticle(data))
    .catch(err => showError('تعذّر تحميل المحتوى: ' + err.message));
  function renderArticle(d) {
    const c = d.content;
    document.title = d.title + ' | أكاديمية Analytix';
    document.querySelector('meta[name="description"]')?.setAttribute('content', d.meta?.description || '');
    document.querySelector('.article-category').textContent = (d.category || type).toUpperCase();
    document.querySelector('.article-category-crumb').textContent = (d.category || type).toUpperCase();
    document.querySelector('.article-title-main').textContent = d.title;
    document.querySelector('.article-subtitle').textContent = d.titleEn || '';
    document.querySelector('.article-reading-time').textContent = d.readingTime || '';
    document.querySelector('.article-updated').textContent = formatDate(d.updatedDate);
    document.querySelector('.article-sections').innerHTML = buildSections(c.sections || []);
    const takeEl = document.querySelector('.article-takeaways');
    if (c.keyTakeaways?.length) {
      takeEl.innerHTML = `<div class="takeaways-box"><h3 class="takeaways-title">الملخص والفائدة العملية</h3><ul class="takeaways-list">${c.keyTakeaways.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
    }
    const relEl = document.querySelector('.article-related');
    if (c.relatedContent?.length) {
      relEl.innerHTML = `<h3 class="related-title">مقالات ذات صلة</h3><div class="related-grid">${c.relatedContent.map(r=>`<a href="article.html?type=${guessType(r.id)}&id=${r.id}" class="related-card"><span class="related-tag">${r.id.split('-')[0].toUpperCase()}</span><span class="related-name">${r.title}</span></a>`).join('')}</div>`;
    }
    const tagsEl = document.querySelector('.article-tags');
    if (tagsEl && d.tags?.length) {
      tagsEl.innerHTML = d.tags.map(t=>`<span class="tag-pill">${t}</span>`).join('');
    }
    document.querySelector('.pdf-download-btn')?.addEventListener('click', () => printArticle(d));
  }
  function buildSections(sections) {
    return sections.map(s => {
      switch(s.type) {
        case 'heading': return `<h${s.level} class="section-heading level-${s.level}">${s.text}</h${s.level}>`;
        case 'paragraph': return `<p class="section-para">${s.text}</p>`;
        case 'list': return `<${s.style==='numbered'?'ol':'ul'} class="section-list">${s.items.map(i=>`<li>${i}</li>`).join('')}</${s.style==='numbered'?'ol':'ul'}>`;
        case 'callout': return `<div class="callout callout-${s.variant}">${s.title?`<div class="callout-title">${s.title}</div>`:''}<div class="callout-text">${s.text}</div></div>`;
        case 'example': return `<div class="example-box"><div class="example-header">مثال بالأرقام</div>${s.title?`<div class="example-title">${s.title}</div>`:''}<div class="example-scenario"><span class="ex-label">الموقف: </span>${s.scenario||''}</div><div class="example-solution"><span class="ex-label">الحل: </span>${s.solution||''}</div></div>`;
        case 'table': return s.headers?`<div class="table-wrap"><table class="content-table"><thead><tr>${s.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${s.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
        default: return '';
      }
    }).join('');
  }
  function guessType(id) {
    if (id.startsWith('ias')) return 'ias';
    if (id.startsWith('ifrs')) return 'ifrs';
    if (id.includes('sox')||id.includes('section')) return 'sox';
    if (id.includes('coso')) return 'coso';
    return 'cfo';
  }
  function formatDate(d) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'}); } catch(e) { return d; }
  }
  function showError(msg) {
    document.querySelector('.article-sections').innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--text-muted)">${msg}</div>`;
  }
  function printArticle(d) {
    const sections = document.querySelector('.article-sections')?.innerHTML||'';
    const takeaways = document.querySelector('.article-takeaways')?.innerHTML||'';
    const w = window.open('','_blank');
    w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${d.title} | أكاديمية Analytix</title><style>@page{size:A4;margin:2cm}body{font-family:Arial,sans-serif;line-height:1.7;color:#1a1a1a;direction:rtl}.pdf-header{background:#0d0d0d;color:#D4AF37;padding:20px 28px;display:flex;justify-content:space-between;align-items:center}.pdf-header h1{margin:0;font-size:13px}.logo{font-size:18px;font-weight:900}.article-title{background:linear-gradient(135deg,#D4AF37,#f0c040);color:#0d0d0d;padding:28px;text-align:center;font-size:22px;font-weight:900}.article-title small{display:block;font-size:13px;opacity:.7;margin-top:4px}.body{padding:24px 28px}h2{color:#D4AF37;font-size:16px;border-bottom:1px solid #eee;padding-bottom:6px}p,li{font-size:13px;line-height:1.8}.callout{padding:12px 16px;margin:14px 0;border-radius:6px;border-right:4px solid #D4AF37;background:#fffbf0}.callout-title{font-weight:700;margin-bottom:4px}.example-box{border:2px solid #D4AF37;border-radius:8px;padding:16px;margin:16px 0;background:#fffbf0}.example-header{background:#D4AF37;color:#0d0d0d;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:700;margin-bottom:10px;display:inline-block}.ex-label{font-weight:700;color:#b8960a}.takeaways-box{background:#0d0d0d;color:#fff;padding:20px;border-radius:8px;margin-top:24px}.takeaways-title{color:#D4AF37;margin:0 0 12px}.takeaways-list li{font-size:13px;margin-bottom:6px}.pdf-footer{text-align:center;font-size:11px;color:#999;margin-top:40px;padding-top:12px;border-top:1px solid #eee}</style></head><body><div class="pdf-header"><div class="logo">Analytix Academy</div><h1>أكاديمية Analytix — المرجع المالي والمحاسبي</h1></div><div class="article-title">${d.title}<small>${d.titleEn||''}</small></div><div class="body"><p style="background:#f5f5f5;padding:14px;border-radius:6px;font-size:13px">${d.content?.summary||''}</p>${sections}${takeaways}<div class="pdf-footer">© 2026 أكاديمية Analytix | analytix.finance/academy | هذا المحتوى مجاني للاستخدام الشخصي والمهني</div></div></body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),800);
  }
})();
