document.addEventListener("DOMContentLoaded", function() {
  var params = new URLSearchParams(window.location.search);
  var type = params.get("type");
  var id = params.get("id");
  if (!type || !id) { showError("link error"); return; }
  var paths = {
    ias: "data/standards/ias/"+id+".json",
    ifrs: "data/standards/ifrs/"+id+".json",
    sox: "data/standards/sox/"+id+".json",
    coso: "data/standards/coso/"+id+".json",
    cfo: "data/cfo-tasks/"+id+".json",
    controls: "data/internal-controls/"+id+".json",
    articles: "data/articles/"+id+".json",
    featured: "data/articles/"+id+".json"
  };
  if (!paths[type]) { showError("unknown type"); return; }
  fetch(paths[type])
    .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(data) { renderArticle(data); })
    .catch(function(e) { showError(e.message); });
  function renderArticle(d) {
    var c = d.content;
    document.title = d.title + " | Analytix";
    var descEl = document.querySelector("meta[name=description]");
    if (descEl) descEl.setAttribute("content", d.meta && d.meta.description ? d.meta.description : "");
    setText(".article-category", (d.category||type).toUpperCase());
    setText(".article-category-crumb", (d.category||type).toUpperCase());
    setText(".article-title-main", d.title);
    setText(".article-subtitle", d.titleEn||"");
    setText(".article-reading-time", d.readingTime||"");
    setText(".article-updated", formatDate(d.updatedDate));
    setHTML(".article-sections", buildSections(c.sections||[]));
    var takeEl = document.querySelector(".article-takeaways");
    if (takeEl && c.keyTakeaways && c.keyTakeaways.length) {
      var items = c.keyTakeaways.map(function(t){return "<li>"+t+"</li>";}).join("");
      takeEl.innerHTML = "<div class='takeaways-box'><h3 class='takeaways-title'>\u0627\u0644\u0645\u0644\u062e\u0635 \u0648\u0627\u0644\u0641\u0627\u0626\u062f\u0629 \u0627\u0644\u0639\u0645\u0644\u064a\u0629</h3><ul class='takeaways-list'>"+items+"</ul></div>";
    }
    var relEl = document.querySelector(".article-related");
    if (relEl && c.relatedContent && c.relatedContent.length) {
      var cards = c.relatedContent.map(function(r){
        return "<a href='article.html?type="+guessType(r.id)+"&id="+r.id+"' class='related-card'><span class='related-tag'>"+r.id.split("-")[0].toUpperCase()+"</span><span class='related-name'>"+r.title+"</span></a>";
      }).join("");
      relEl.innerHTML = "<h3 class='related-title'>\u0645\u0642\u0627\u0644\u0627\u062a \u0630\u0627\u062a \u0635\u0644\u0629</h3><div class='related-grid'>"+cards+"</div>";
    }
    var tagsEl = document.querySelector(".article-tags");
    if (tagsEl && d.tags && d.tags.length) {
      tagsEl.innerHTML = d.tags.map(function(t){return "<span class='tag-pill'>"+t+"</span>";}).join("");
    }
    var btn = var sigEl=document.querySelector(".article-signature"); if(sigEl){sigEl.innerHTML="<div class='author-signature'><img src='assets/signature.png' alt='توقيع'><div class='sig-name'>مدحت مهنا</div><div class='sig-title'>مؤسس ومطور أكاديمية Analytix</div></div>";} document.querySelector(".pdf-download-btn");
    if (btn) btn.addEventListener("click", function(){ printArticle(d); });
  }
  function buildSections(sections) {
    return sections.map(function(s) {
      if (s.type === "heading") return "<h"+s.level+" class='section-heading level-"+s.level+"'>"+s.text+"</h"+s.level+">";
      if (s.type === "paragraph") return "<p class='section-para'>"+s.text+"</p>";
      if (s.type === "list") {
        var t = s.style === "numbered" ? "ol" : "ul";
        return "<"+t+" class='section-list'>"+s.items.map(function(i){return "<li>"+i+"</li>";}).join("")+"</"+t+">";
      }
      if (s.type === "callout") return "<div class='callout callout-"+s.variant+"'>"+(s.title?"<div class='callout-title'>"+s.title+"</div>":"")+"<div class='callout-text'>"+s.text+"</div></div>";
      if (s.type === "example") return "<div class='example-box'><div class='example-header'>\u0645\u062b\u0627\u0644 \u0628\u0627\u0644\u0623\u0631\u0642\u0627\u0645</div>"+(s.title?"<div class='example-title'>"+s.title+"</div>":"")+"<div class='example-scenario'><b>\u0627\u0644\u0645\u0648\u0642\u0641:</b> "+(s.scenario||"")+"</div><div class='example-solution'><b>\u0627\u0644\u062d\u0644:</b> "+(s.solution||"")+"</div></div>";
      if (s.type === "table" && s.headers) {
        var rows = s.rows.map(function(r){return "<tr>"+r.map(function(c){return "<td>"+c+"</td>";}).join("")+"</tr>";}).join("");
        return "<div class='table-wrap'><table class='content-table'><thead><tr>"+s.headers.map(function(h){return "<th>"+h+"</th>";}).join("")+"</tr></thead><tbody>"+rows+"</tbody></table></div>";
      }
      return "";
    }).join("");
  }
  function guessType(id) {
    if (id.indexOf("ias")===0) return "ias";
    if (id.indexOf("ifrs")===0) return "ifrs";
    if (id.indexOf("sox")>=0||id.indexOf("section")>=0) return "sox";
    if (id.indexOf("coso")>=0) return "coso";
    return "cfo";
  }
  function formatDate(d) {
    if (!d) return "";
    try { return new Date(d).toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}); } catch(e) { return d; }
  }
  function setText(sel, val) { var el=document.querySelector(sel); if(el) el.textContent=val; }
  function setHTML(sel, val) { var el=document.querySelector(sel); if(el) el.innerHTML=val; }
  function showError(msg) { setHTML(".article-sections","<div style='text-align:center;padding:60px 20px;color:var(--text-muted)'>"+msg+"</div>"); }
  function printArticle(d) {
    var sections = document.querySelector(".article-sections") ? document.querySelector(".article-sections").innerHTML : "";
    var takeaways = document.querySelector(".article-takeaways") ? document.querySelector(".article-takeaways").innerHTML : "";
    var w = window.open("","_blank");
    w.document.write("<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'><title>"+d.title+"</title><style>@page{size:A4;margin:2cm}body{font-family:Arial;line-height:1.7;color:#1a1a1a;direction:rtl}.hdr{background:#0d0d0d;color:#D4AF37;padding:16px 24px;font-size:13px}.ttl{background:linear-gradient(135deg,#D4AF37,#f0c040);color:#0d0d0d;padding:24px;text-align:center;font-size:20px;font-weight:900}.bdy{padding:24px}h2{color:#D4AF37;font-size:15px;border-bottom:1px solid #eee;padding-bottom:4px}p,li{font-size:13px;line-height:1.8}.callout{padding:12px;margin:12px 0;border-radius:6px;border-right:4px solid #D4AF37;background:#fffbf0}.example-box{border:2px solid #D4AF37;border-radius:8px;padding:14px;margin:14px 0}.example-header{background:#D4AF37;color:#0d0d0d;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:8px}.takeaways-box{background:#0d0d0d;color:#fff;padding:18px;border-radius:8px;margin-top:20px}.takeaways-title{color:#D4AF37;margin:0 0 10px}ul,ol{padding-right:18px}</style></head><body><div class='hdr'>Analytix Academy | analytix.finance/academy</div><div class='ttl'>"+d.title+"</div><div class='bdy'><p style='background:#f5f5f5;padding:12px;border-radius:6px;font-size:13px'>"+(d.content&&d.content.summary?d.content.summary:"")+"</p>"+sections+takeaways+"</div></body></html>");
    w.document.close();
    setTimeout(function(){w.print();},800);
  }
});
