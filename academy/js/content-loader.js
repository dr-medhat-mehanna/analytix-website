document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    if (!type || !id) {
        document.getElementById('article-content').innerHTML = '<p class="error">خطأ: لم يتم تحديد المقال</p>';
        return;
    }

    const articlePath = `data/standards/${type}/${id}.json`;

    fetch(articlePath)
        .then(response => {
            if (!response.ok) throw new Error('Article not found');
            return response.json();
        })
        .then(data => {
            renderArticle(data);
        })
        .catch(error => {
            document.getElementById('article-content').innerHTML = '<p class="error">خطأ في تحميل المقال</p>';
        });
});

function renderArticle(data) {
    const articleContent = document.getElementById('article-content');
    
    // العنوان
    document.getElementById('article-title').textContent = data.title;
    
    // الملخص
    document.getElementById('article-summary').textContent = data.content.summary;
    
    // المحتوى الأساسي
    let contentHTML = '';
    
    if (data.content.sections) {
        data.content.sections.forEach(section => {
            contentHTML += renderSection(section);
        });
    }
    
    // النقاط الرئيسية
    if (data.content.keyTakeaways) {
        contentHTML += '<div class="key-takeaways"><h3>📌 النقاط الرئيسية</h3><ul>';
        data.content.keyTakeaways.forEach(point => {
            contentHTML += `<li>${point}</li>`;
        });
        contentHTML += '</ul></div>';
    }
    
    // المحتوى المترابط
    if (data.content.relatedContent) {
        contentHTML += '<div class="related-content"><h3>📚 مقالات ذات صلة</h3><ul>';
        data.content.relatedContent.forEach(item => {
            contentHTML += `<li><a href="article.html?type=${item.type}&id=${item.id}">${item.title}</a></li>`;
        });
        contentHTML += '</ul></div>';
    }
    
    articleContent.innerHTML = contentHTML;
}

function renderSection(section) {
    if (section.type === 'heading') {
        return `<h${section.level}>${section.text}</h${section.level}>`;
    } else if (section.type === 'paragraph') {
        return `<p>${section.text}</p>`;
    } else if (section.type === 'list') {
        const listType = section.style === 'numbered' ? 'ol' : 'ul';
        let listHTML = `<${listType}>`;
        section.items.forEach(item => {
            listHTML += `<li>${item}</li>`;
        });
        listHTML += `</${listType}>`;
        return listHTML;
    } else if (section.type === 'callout') {
        return `<div class="callout ${section.variant}">
                    <h4>${section.title}</h4>
                    <p>${section.text}</p>
                </div>`;
    } else if (section.type === 'example') {
        return `<div class="example">
                    <h4>${section.title}</h4>
                    <div class="scenario"><strong>السيناريو:</strong> ${section.scenario}</div>
                    <div class="solution"><strong>الحل:</strong> ${section.solution}</div>
                </div>`;
    }
    
    return '';
}
