/* Article PDF Integration */
document.addEventListener('DOMContentLoaded', function() {
  // ربط أزرار PDF
  const pdfButtons = document.querySelectorAll('.pdf-download-btn');
  
  pdfButtons.forEach(btn => {
    btn.addEventListener('click', async function() {
      // الحصول على معرف المعيار من URL
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      const id = urlParams.get('id');
      
      if (!type || !id) {
        alert('حدث خطأ في تحديد المعيار');
        return;
      }
      
      try {
        // تحميل بيانات المعيار
        const response = await fetch(`data/standards/${type}/${id}.json`);
        const standardData = await response.json();
        
        // توليد PDF
        window.AnalytixPDF.generateStandardPDF(standardData);
        
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('حدث خطأ في توليد ملف PDF');
      }
    });
  });
});
