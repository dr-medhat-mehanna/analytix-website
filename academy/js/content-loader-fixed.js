document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    if (!type || !id) {
        document.getElementById('article-content').innerHTML = '<p>خطأ: لم يتم تحديد المقال</p>';
        return;
    }

    fetch('data/standards/' + type + '/' + id + '.json')
        .then(response => response.json())
        .then(data => {
            // العنوان
            document.getElementById('article-title').textContent = data.title;
            
            // الملخص  
            document.getElementById('article-summary').textContent = data.content.summary;
            
            // المحتوى
            let html = '';
            if (data.content.sections) {
                data.content.sections.forEach(section => {
                    if (section.type === 'heading') {
                        html += '<h' + section.level + '>' + section.text + '</h' + section.level + '>';
                    } else if (section.type === 'paragraph') {
                        html += '<p>' + section.text + '</p>';
                    } else if (section.type === 'list') {
                        const listType = section.style === 'numbered' ? 'ol' : 'ul';
                        html += '<' + listType + '>';
                        section.items.forEach(item => {
                            html += '<li>' + item + '</li>';
                        });
                        html += '</' + listType + '>';
                    } else if (section.type === 'callout') {
                        html += '<div class="callout ' + section.variant + '">';
                        html += '<h4>' + section.title + '</h4>';
                        html += '<p>' + section.text + '</p>';
                        html += '</div>';
                    } else if (section.type === 'example') {
                        html += '<div class="example">';
                        html += '<h4>' + section.title + '</h4>';
                        html += '<div><strong>السيناريو:</strong> ' + section.scenario + '</div>';
                        html += '<div><strong>الحل:</strong> ' + section.solution + '</div>';
                        html += '</div>';
                    }
                });
            }
            
            // النقاط الرئيسية
            if (data.content.keyTakeaways) {
                html += '<div class="key-takeaways"><h3>النقاط الرئيسية</h3><ul>';
                data.content.keyTakeaways.forEach(point => {
                    html += '<li>' + point + '</li>';
                });
                html += '</ul></div>';
            }
            
            document.getElementById('article-content').innerHTML = html;
        })
        .catch(error => {
            document.getElementById('article-content').innerHTML = '<p>خطأ في تحميل المقال</p>';
        });
});
