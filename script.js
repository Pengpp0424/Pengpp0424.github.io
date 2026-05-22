// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 加载 JSON 数据
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            populateProfile(data.profile);
            populateWorks(data.works);
            populateNews(data.news);  // 从 data.json 加载新闻
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

// 填充作品展示（支持嵌入播放）
function populateWorks(works) {
    const worksContainer = document.getElementById('worksGrid');
    if (!worksContainer) return;

    worksContainer.innerHTML = '';

    works.forEach(work => {
        const workCard = document.createElement('div');
        workCard.className = `work-card ${work.size === 'large' ? 'work-card-large' : ''}`;

        let mediaContent = '';
        if (work.bvid) {
            // 嵌入 B 站播放器
            mediaContent = `
                <div class="work-embed">
                    <iframe src="//player.bilibili.com/player.html?bvid=${work.bvid}&page=1"
                            scrolling="no"
                            border="0"
                            frameborder="no"
                            framespacing="0"
                            allowfullscreen="true"
                            width="100%"
                            height="300">
                    </iframe>
                </div>
            `;
        } else {
            //  fallback：渐变缩略图
            mediaContent = `
                <div class="work-thumb" style="background: ${work.gradient};">
                    <div class="work-thumb-icon">${work.icon}</div>
                    <div class="work-play">▶</div>
                </div>
            `;
        }

        workCard.innerHTML = `
            ${mediaContent}
            <div class="work-info">
                <span class="work-tag">${work.tag}</span>
                <h3>${work.title}</h3>
                <p>${work.description}</p>
            </div>
        `;

        worksContainer.appendChild(workCard);
    });
}

// 填充新闻动态（从 data.json 加载）
function populateNews(news) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    newsGrid.innerHTML = '';

    if (!news || news.length === 0) {
        newsGrid.innerHTML = '<p style="text-align: center; color: #666;">暂无动态</p>';
        return;
    }

    news.forEach(item => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';

        const pubDate = new Date(item.date).toLocaleDateString('zh-CN');

        newsCard.innerHTML = `
            <div class="news-date">${pubDate}</div>
            <h3 class="news-title">
                <a href="${item.url || '#'}" target="_blank" rel="noopener">${item.title}</a>
            </h3>
            <p class="news-excerpt">${item.excerpt}</p>
        `;

        newsGrid.appendChild(newsCard);
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
    qqCard.href = `#`;
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
    bilibiliCard.rel = 'noopener';
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
    xiaohongshuCard.rel = 'noopener';
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
    kuaishouCard.rel = 'noopener';
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
