// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 加载 JSON 数据
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            populateProfile(data.profile);
            populateWorks(data.works);
            populateContact(data.contact);
            populateFooter(data.footer);
        })
        .catch(error => console.error('加载数据失败:', error));

    // 导航栏滚动效果
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // 加载新闻
    loadNews();
});

// 填充个人信息
function populateProfile(profile) {
    // Hero 区描述
    const heroDesc = document.getElementById('heroDesc');
    if (heroDesc) heroDesc.textContent = profile.tagline;

    // 关于我 - 简介
    const aboutLead = document.getElementById('aboutLead');
    if (aboutLead) aboutLead.textContent = profile.bio[0];

    const aboutBio1 = document.getElementById('aboutBio1');
    if (aboutBio1) aboutBio1.textContent = profile.bio[1];

    const aboutBio2 = document.getElementById('aboutBio2');
    if (aboutBio2) aboutBio2.textContent = profile.bio[2];

    // 统计数据
    const statsContainer = document.getElementById('aboutStats');
    if (statsContainer) {
        statsContainer.innerHTML = '';
        profile.stats.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat';
            statDiv.innerHTML = `
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label}</span>
            `;
            statsContainer.appendChild(statDiv);
        });
    }

    // 个人卡片
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = profile.name;

    const profileTitle = document.getElementById('profileTitle');
    if (profileTitle) profileTitle.textContent = profile.title;

    const profileGames = document.getElementById('profileGames');
    if (profileGames) profileGames.textContent = profile.games;

    const profileTools = document.getElementById('profileTools');
    if (profileTools) profileTools.textContent = profile.tools;

    const profileAISkills = document.getElementById('profileAISkills');
    if (profileAISkills) profileAISkills.textContent = profile.ai_skills;

    const profilePrinciples = document.getElementById('profilePrinciples');
    if (profilePrinciples) profilePrinciples.textContent = profile.principles;
}

// 填充作品展示
function populateWorks(works) {
    const worksContainer = document.getElementById('worksGrid');
    if (!worksContainer) return;

    worksContainer.innerHTML = '';

    works.forEach(work => {
        const workCard = document.createElement('div');
        workCard.className = `work-card ${work.size === 'large' ? 'work-card-large' : ''}`;

        workCard.innerHTML = `
            <div class="work-thumb" style="background: ${work.gradient};">
                <div class="work-thumb-icon">${work.icon}</div>
                <div class="work-play">▶</div>
            </div>
            <div class="work-info">
                <span class="work-tag">${work.tag}</span>
                <h3>${work.title}</h3>
                <p>${work.description}</p>
            </div>
        `;

        worksContainer.appendChild(workCard);
    });
}

// 填充联系方式
function populateContact(contact) {
    const contactContainer = document.getElementById('contactLinks');
    if (!contactContainer) return;

    contactContainer.innerHTML = '';

    // 邮箱
    const emailCard = document.createElement('a');
    emailCard.href = `mailto:${contact.email}`;
    emailCard.className = 'contact-card';
    emailCard.innerHTML = `
        <div class="contact-icon">📧</div>
        <div>
            <h3>邮箱</h3>
            <p>${contact.email}</p>
        </div>
    `;
    contactContainer.appendChild(emailCard);

    // QQ
    const qqCard = document.createElement('a');
    qqCard.href = '#';
    qqCard.className = 'contact-card';
    qqCard.innerHTML = `
        <div class="contact-icon">💬</div>
        <div>
            <h3>QQ</h3>
            <p>${contact.qq}</p>
        </div>
    `;
    contactContainer.appendChild(qqCard);

    // 哔哩哔哩
    const bilibiliCard = document.createElement('a');
    bilibiliCard.href = contact.bilibili.url;
    bilibiliCard.target = '_blank';
    bilibiliCard.className = 'contact-card';
    bilibiliCard.innerHTML = `
        <div class="contact-icon">📺</div>
        <div>
            <h3>${contact.bilibili.name}</h3>
            <p>${contact.bilibili.username}</p>
        </div>
    `;
    contactContainer.appendChild(bilibiliCard);

    // 小红书
    const xiaohongshuCard = document.createElement('a');
    xiaohongshuCard.href = contact.xiaohongshu.url;
    xiaohongshuCard.target = '_blank';
    xiaohongshuCard.className = 'contact-card';
    xiaohongshuCard.innerHTML = `
        <div class="contact-icon">📕</div>
        <div>
            <h3>${contact.xiaohongshu.name}</h3>
            <p>${contact.xiaohongshu.stats}</p>
        </div>
    `;
    contactContainer.appendChild(xiaohongshuCard);

    // 快手
    const kuaishouCard = document.createElement('a');
    kuaishouCard.href = contact.kuaishou.url;
    kuaishouCard.target = '_blank';
    kuaishouCard.className = 'contact-card';
    kuaishouCard.innerHTML = `
        <div class="contact-icon">⚡</div>
        <div>
            <h3>${contact.kuaishou.name}</h3>
            <p>${contact.kuaishou.username}</p>
        </div>
    `;
    contactContainer.appendChild(kuaishouCard);
}

// 填充页脚
function populateFooter(footerText) {
    const footer = document.getElementById('footerText');
    if (footer) footer.textContent = footerText;
}

// 加载新闻动态（RSS）
function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    // 多个RSS源
    const RSS_FEEDS = [
        'https://www.3dmgame.com/news/rss.xml',
        'https://36kr.com/feed',
        'https://www.ithome.com/rss/'
    ];

    // 使用 RSS2JSON 服务（免费，无需API key）
    const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

    // 清空加载提示
    newsGrid.innerHTML = '';

    // 只加载第一个可用的RSS源
    fetch(RSS2JSON_API + encodeURIComponent(RSS_FEEDS[0]))
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.items) {
                const newsItems = data.items.slice(0, 6); // 只取前6条

                newsItems.forEach(item => {
                    const newsCard = document.createElement('div');
                    newsCard.className = 'news-card';

                    const pubDate = new Date(item.pubDate).toLocaleDateString('zh-CN');

                    newsCard.innerHTML = `
                        <div class="news-date">${pubDate}</div>
                        <h3 class="news-title">${item.title}</h3>
                        <p class="news-excerpt">${item.description.substring(0, 100)}...</p>
                        <a href="${item.link}" target="_blank" class="news-link">阅读全文 →</a>
                    `;

                    newsGrid.appendChild(newsCard);
                });
            } else {
                throw new Error('RSS解析失败');
            }
        })
        .catch(error => {
            console.error('加载新闻失败:', error);
            newsGrid.innerHTML = '<p class="news-error">暂时无法加载动态，请稍后再试。</p>';
        });
}
