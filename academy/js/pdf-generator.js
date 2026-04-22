/* PDF Generator with Platform Branding */
class AnalytixPDFGenerator {
  constructor() {
    this.brandColors = {
      primary: '#D4AF37',
      secondary: '#1E293B', 
      accent: '#F59E0B'
    };
  }

  async generateStandardPDF(standardData) {
    // إنشاء محتوى HTML للطباعة
    const printContent = this.createPrintableHTML(standardData);
    
    // فتح نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // تطبيق الستايل وطباعة
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  createPrintableHTML(data) {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${data.title} | أكاديمية Analytix</title>
<style>
  @page {
    size: A4;
    margin: 2cm;
    background: white;
  }
  
  * {
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    margin: 0;
    padding: 0;
  }
  
  .pdf-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid ${this.brandColors.primary};
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  
  .pdf-logo {
    width: 120px;
    height: auto;
  }
  
  .pdf-brand {
    text-align: center;
    flex: 1;
    margin: 0 20px;
  }
  
  .pdf-brand h1 {
    color: ${this.brandColors.primary};
    font-size: 24px;
    margin: 0;
    font-weight: bold;
  }
  
  .pdf-brand p {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 14px;
  }
  
  .pdf-date {
    text-align: left;
    font-size: 12px;
    color: #999;
  }
  
  .standard-title {
    background: linear-gradient(135deg, ${this.brandColors.primary}, ${this.brandColors.accent});
    color: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .standard-title h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
  }
  
  .standard-title .subtitle {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
  }
  
  .content-section {
    margin-bottom: 25px;
  }
  
  .section-title {
    color: ${this.brandColors.secondary};
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .summary-box {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .key-points {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 15px;
    margin: 15px 0;
  }
  
  .key-points ul {
    margin: 10px 0;
    padding-right: 20px;
  }
  
  .key-points li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .standards-badges {
    text-align: center;
    margin: 20px 0;
  }
  
  .standard-badge {
    display: inline-block;
    background: ${this.brandColors.primary};
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    margin: 5px;
  }
  
  .pdf-footer {
    position: fixed;
    bottom: 1cm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 11px;
    color: #999;
    border-top: 1px solid #eee;
    padding-top: 10px;
  }
  
  .watermark {
    position: fixed;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%) rotate(-45deg);
    font-size: 72px;
    color: rgba(212, 175, 55, 0.1);
    z-index: -1;
    font-weight: bold;
  }
  
  @media print {
    body { print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<div class="watermark">ANALYTIX</div>

<div class="pdf-header">
  <div class="pdf-logo">
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
      <rect width="120" height="40" fill="${this.brandColors.primary}" rx="8"/>
      <text x="60" y="25" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Analytix</text>
    </svg>
  </div>
  <div class="pdf-brand">
    <h1>أكاديمية Analytix</h1>
    <p>المرجع الشامل للمعايير المحاسبية والمالية</p>
  </div>
  <div class="pdf-date">
    ${new Date().toLocaleDateString('ar-EG')}
  </div>
</div>

<div class="standard-title">
  <h1>${data.title}</h1>
  <p class="subtitle">${data.titleEn || ''}</p>
</div>

<div class="content-section">
  <div class="summary-box">
    <div class="section-title">📋 ملخص المعيار</div>
    <p>${data.content?.summary || ''}</p>
  </div>
</div>

${data.content?.keyTakeaways ? `
<div class="content-section">
  <div class="key-points">
    <div class="section-title">📌 النقاط الرئيسية</div>
    <ul>
      ${data.content.keyTakeaways.map(point => `<li>${point}</li>`).join('')}
    </ul>
  </div>
</div>
` : ''}

${data.tags ? `
<div class="standards-badges">
  ${data.tags.map(tag => `<span class="standard-badge">${tag}</span>`).join('')}
</div>
` : ''}

<div class="pdf-footer">
  <p>© ${new Date().getFullYear()} أكاديمية Analytix | https://analytix.finance/academy</p>
  <p>تم إنشاء هذا التقرير تلقائياً من منصة Analytix للتحليل المالي</p>
</div>

</body>
</html>`;
  }
}

// تصدير النظام
window.AnalytixPDF = new AnalytixPDFGenerator();
