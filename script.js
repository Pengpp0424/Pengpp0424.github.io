// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Debug] 开始加载数据...');
    
    // 显示骨架屏（HTML 中已写好）
    // 开始加载 JSON 数据
    fetch('data.json?v=' + Date.now())  // 防缓存
        .then(response => {
            console.log('[Debug] HTTP 状态:', response.status);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('[Debug] 数据加载成功:', Object.keys(data));
            
            // 填充数据
            populateProfile(data.profile);
            populateWorks(data.works);
            populateNews(data.news);
            populateContact(data.contact);
            populateFooter(data.footer);
            
            // 移除骨架屏
            removeSkeletons();
        })
        .catch(error => {
            console.error('[Debug] 加载数据失败:', error);
            // 加载失败也移除骨架屏，显示错误信息
            removeSkeletons();
            const worksGrid = document.getElementById('worksGrid');
            const newsGrid = document.getElementById('newsGrid');
            if (worksGrid) worksGrid.innerHTML = '<p style="color:orange;text-align:center;">⚠️ 作品加载失败，请刷新页面</p>';
            if (newsGrid) newsGrid.innerHTML = '<p style="color:orange;text-align:center;">⚠️ 动态加载失败，请刷新页面</p>';
        });

    // 移除骨架屏函数
    function removeSkeletons() {
        const worksSkeleton = document.getElementById('worksSkeleton');
        if (worksSkeleton) worksSkeleton.remove();
        
        const newsLoading = document.querySelector('.news-loading');
        if (newsLoading) newsLoading.remove();
        
        const aboutSkeleton = document.getElementById('aboutSkeleton');
        if (aboutSkeleton) aboutSkeleton.remove();
    }

    // 导航栏滚动效果 + 回到顶部按钮
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        // 导航栏效果
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // 回到顶部按钮显示/隐藏
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    // 回到顶部按钮点击事件
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

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

// 填充作品展示（支持嵌入播放和筛选）
function populateWorks(works) {
    const worksContainer = document.getElementById('worksGrid');
    if (!worksContainer) return;

    worksContainer.innerHTML = '';

    works.forEach(work => {
        const workCard = document.createElement('div');
        workCard.className = `work-card ${work.size === 'large' ? 'work-card-large' : ''}`;
        workCard.dataset.tags = work.tag;  // 用于筛选

        let mediaContent = '';
        if (work.bvid) {
            // 嵌入 B 站播放器
            // 只有《零》(id=1) 自动播放（有声音），其他作品不自动播放
            const autoplayParam = (work.id === 1) ? '&autoplay=1' : '&autoplay=0';
            mediaContent = `
                <div class="work-embed">
                    <iframe src="//player.bilibili.com/player.html?bvid=${work.bvid}&page=1${autoplayParam}"
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
        } else if (work.link) {
            // 外部链接（如快手）
            mediaContent = `
                <a href="${work.link}" target="_blank" rel="noopener" class="work-thumb-link" style="background: ${work.gradient};">
                    <div class="work-thumb-icon">${work.icon}</div>
                    <div class="work-play">▶</div>
                </a>
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

    // 抖音
    const douyinCard = document.createElement('a');
    douyinCard.href = contact.douyin.url;
    douyinCard.target = '_blank';
    douyinCard.rel = 'noopener';
    douyinCard.className = 'contact-card';
    douyinCard.innerHTML = `
        <div class="contact-icon">🎵</div>
        <div>
            <h3>${contact.douyin.name}</h3>
            <p>${contact.douyin.username}</p>
        </div>
    `;
    contactContainer.appendChild(douyinCard);

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

// ========== 作品筛选功能 ==========
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const worksGrid = document.getElementById('worksGrid');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            const workCards = worksGrid.querySelectorAll('.work-card');

            workCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = '';
                } else {
                    const tags = card.dataset.tags || '';
                    if (tags.includes(filter)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
});

// ========== 主题切换功能 ==========
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            html.dataset.theme = 'light';
            themeToggle.textContent = '☀️';
        }

        themeToggle.addEventListener('click', function() {
            if (html.dataset.theme === 'light') {
                delete html.dataset.theme;
                this.textContent = '🌙';
                localStorage.setItem('theme', 'dark');
            } else {
                html.dataset.theme = 'light';
                this.textContent = '☀️';
                localStorage.setItem('theme', 'light');
            }
        });
    }
});
