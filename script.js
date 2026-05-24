// 动态更新资源版本号（根据 data.json 的 lastUpdated）
function updateResourceVersions(lastUpdated) {
    if (!lastUpdated) return;
    
    const version = 'v=' + lastUpdated.replace(/-/g, '');  // "2026-05-23" → "v=20260523"
    
    // 更新 script.js
    const scriptTag = document.querySelector('script[src*="script.js"]');
    if (scriptTag) {
        const newSrc = 'script.js?' + version;
        if (!scriptTag.src.includes(version)) {
            scriptTag.src = newSrc;
            console.log('[Debug] script.js 版本更新为:', version);
        }
    }
    
    // 更新 style.css
    const styleTag = document.querySelector('link[href*="style.css"]');
    if (styleTag) {
        const newHref = 'style.css?' + version;
        if (!styleTag.href.includes(version)) {
            styleTag.href = newHref;
            console.log('[Debug] style.css 版本更新为:', version);
        }
    }
}

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Debug] 开始加载数据...');
    
    // 默认数据（降级方案）
    const fallbackData = {
        lastUpdated: "2026-05-23",
        profile: {
            name: "蓬碰鹏",
            title: "老鹏 · 视频创作者 / AI探索者",
            lead: "热爱游戏与AI的视频创作者",
            bio1: "专注游戏实况与AI工具探索",
            bio2: "用心创作每一帧",
            stats: [
                { label: "作品", value: "10+" },
                { label: "平台", value: "B站/抖音" },
                { label: "方向", value: "游戏/AI" }
            ],
            games: "艾尔登法环、战神、漫威蜘蛛侠",
            tools: "Ollama、ComfyUI、FFmpeg",
            aiSkills: "本地大模型、AI视频生成",
            principles: "原声优先、BGM场景匹配、解说贴合内容"
        },
        works: [
            {
                title: "艾尔登法环 · 剧情向剪辑",
                desc: "黄金树幽影DLC精选片段",
                tags: ["剧情", "大作体验"],
                type: "bilibili",
                bvid: "BV1N6Gh68EJC",
                page: 1
            }
        ],
        news: [
            {
                title: "网站上线啦！",
                date: "2026-05-23",
                excerpt: "个人作品展示网站正式上线，持续更新中...",
                url: "#"
            }
        ],
        contact: {
            email: "105945357@qq.com",
            qq: "105945357",
            douyin: "#",
            xiaohongshu: "#",
            kuaishou: "#"
        },
        footer: "© 2025 蓬碰鹏（老鹏）· 用心创作每一帧"
    };
    
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
            populateGamingNews(data.gaming_news || data.news);
            populateContact(data.contact);
            populateFooter(data.footer);
            
            // 更新资源版本号（根据 lastUpdated）
            if (data.lastUpdated) {
                updateResourceVersions(data.lastUpdated);
            }
            
            // 移除骨架屏
            removeSkeletons();
        })
        .catch(error => {
            console.error('[Debug] 加载数据失败，使用默认数据:', error);
            // 加载失败时使用默认数据
            populateProfile(fallbackData.profile);
            populateWorks(fallbackData.works);
            populateNews(fallbackData.news);
            populateGamingNews(fallbackData.news);
            populateContact(fallbackData.contact);
            populateFooter(fallbackData.footer);
            
            // 更新资源版本号（降级方案）
            if (fallbackData.lastUpdated) {
                updateResourceVersions(fallbackData.lastUpdated);
            }
            
            // 移除骨架屏
            removeSkeletons();
            
            // 显示警告（非阻塞）
            console.warn('[Warning] 使用离线数据，部分内容可能过时');
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

        // 作品点击统计（localStorage）
        workCard.addEventListener('click', (event) => {
            // 如果点击的是 iframe 内部，不统计
            if (event.target.tagName === 'IFRAME') return;
            
            const workId = work.id || work.title;
            const storageKey = `work_clicks_${workId}`;
            const currentClicks = parseInt(localStorage.getItem(storageKey) || '0', 10);
            const newClicks = currentClicks + 1;
            
            localStorage.setItem(storageKey, newClicks.toString());
            console.log(`[统计] 作品点击: ${work.title} (累计 ${newClicks} 次)`);
        });
        
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

// 填充每日新闻速报（滚动条）
function populateGamingNews(news) {
    const ticker = document.getElementById('newsTicker');
    if (!ticker) return;

    ticker.innerHTML = '';

    if (!news || news.length === 0) {
        ticker.innerHTML = '<span class="ticker-item">暂无新闻</span>';
        return;
    }

    // 按日期降序
    const sorted = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 构建条目HTML（重复两份实现无缝滚动）
    let itemsHTML = '';
    sorted.forEach(item => {
        let tagClass = 'tag-game', tagText = '🎮';
        if (item.category === 'tech') { tagClass = 'tag-tech'; tagText = '🔧'; }
        else if (item.category === 'ai') { tagClass = 'tag-ai'; tagText = '🤖'; }

        itemsHTML += `<span class="ticker-item">
            <span class="ticker-tag ${tagClass}">${tagText}</span>
            <span class="ticker-text"><a href="${item.url || '#'}" target="_blank" rel="noopener">${item.title}</a></span>
        </span>`;
    });

    // 两份实现无缝循环
    ticker.innerHTML = itemsHTML + itemsHTML;

    // 更新时间
    const lastUpdate = document.getElementById('newsLastUpdate');
    if (lastUpdate && sorted.length > 0) {
        lastUpdate.textContent = new Date(sorted[0].date).toLocaleDateString('zh-CN');
    }
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
