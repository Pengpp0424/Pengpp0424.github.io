// ========== Navbar Scroll Effect ==========
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========== Smooth Scroll for Nav Links ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========== Scroll Reveal Animation ==========
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

document.querySelectorAll('.section-header, .about-grid > *, .work-card, .contact-card, .news-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// ========== Stagger Delay ==========
document.querySelectorAll('.work-card').forEach((el, i) => el.style.transitionDelay = `${i * 0.08}s`);
document.querySelectorAll('.contact-card').forEach((el, i) => el.style.transitionDelay = `${i * 0.1}s`);
document.querySelectorAll('.news-card').forEach((el, i) => el.style.transitionDelay = `${i * 0.08}s`);

// ========== News Feed ==========
async function loadNews() {
    const grid = document.getElementById('newsGrid');

    // RSS2JSON API - free tier, no CORS issues
    // Multiple RSS feeds for gaming & tech news
    const feeds = [
        {
            url: 'https://www.3dmgame.com/rss/news.xml',
            category: 'game',
            categoryName: '游戏'
        },
        {
            url: 'https://rsshub.app/36kr/newsflashes',
            category: 'tech',
            categoryName: '科技'
        },
        {
            url: 'https://rsshub.app/ithome/ranking/daily',
            category: 'tech',
            categoryName: '科技'
        }
    ];

    // Fallback: curated news items (updated periodically)
    const fallbackNews = [
        {
            title: 'GTA 6 正式预告引发全球热议',
            desc: 'Rockstar Games 发布了 GTA 6 的最新预告片，展示了前所未有的开放世界细节和物理引擎升级。',
            category: 'game', categoryName: '游戏',
            source: 'IGN', date: '2025-12'
        },
        {
            title: 'NVIDIA 发布 RTX 5090 消费级旗舰显卡',
            desc: '搭载 Blackwell 架构，性能相比上代提升显著，AI 图像生成速度翻倍。',
            category: 'tech', categoryName: '硬件',
            source: 'AnandTech', date: '2025-01'
        },
        {
            title: 'Wan2.1 图生视频模型开源：AI视频制作新突破',
            desc: '阿里云开源 Wan2.1 视频生成模型，支持文本/图片到视频生成，质量接近Sora水平。',
            category: 'ai', categoryName: 'AI',
            source: 'Hugging Face', date: '2025-02'
        },
        {
            title: 'Elden Ring 黄金树之影 DLC 获年度最佳扩展',
            desc: 'FromSoftware 的扩展包在全球各大游戏媒体评选中横扫年度最佳 DLC 奖项。',
            category: 'game', categoryName: '游戏',
            source: 'GameSpot', date: '2025-12'
        },
        {
            title: 'ComfyUI 新版支持实时视频生成工作流',
            desc: '开源 AI 图像工具 ComfyUI 更新，新增视频生成节点和 LoRA 训练一站式流程。',
            category: 'ai', categoryName: 'AI',
            source: 'GitHub', date: '2025-03'
        },
        {
            title: 'PS5 Pro 正式发售：4K 60fps 成为标配',
            desc: '索尼推出 PS5 Pro 主机，搭载升级 GPU 和光线追踪加速器，支持 PSSR 超分辨率技术。',
            category: 'tech', categoryName: '硬件',
            source: 'The Verge', date: '2024-11'
        }
    ];

    try {
        // Try fetching real news via RSS2JSON
        let allNews = [];
        
        // Use a free CORS proxy for RSS feeds
        const rssApiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=';
        
        const feedResults = await Promise.allSettled(
            feeds.map(async (feed) => {
                try {
                    const resp = await fetch(rssApiUrl + encodeURIComponent(feed.url), {
                        signal: AbortSignal.timeout(8000)
                    });
                    if (!resp.ok) throw new Error('Fetch failed');
                    const data = await resp.json();
                    if (data.status !== 'ok' || !data.items) throw new Error('No items');
                    return data.items.slice(0, 3).map(item => ({
                        title: item.title,
                        desc: stripHtml(item.description || item.content || '').slice(0, 120) + '...',
                        category: feed.category,
                        categoryName: feed.categoryName,
                        source: feed.categoryName === '游戏' ? '3DM' : '36氪',
                        date: formatDate(item.pubDate),
                        link: item.link
                    }));
                } catch {
                    return [];
                }
            })
        );

        feedResults.forEach(r => {
            if (r.status === 'fulfilled' && r.value.length) {
                allNews.push(...r.value);
            }
        });

        // If real feeds failed, use fallback
        if (allNews.length === 0) {
            allNews = fallbackNews;
        } else {
            // Mix real news with some fallback
            allNews = [...allNews.slice(0, 4), ...fallbackNews.slice(0, 2)].slice(0, 6);
        }

        renderNews(allNews);
    } catch {
        renderNews(fallbackNews);
    }
}

function renderNews(items) {
    const grid = document.getElementById('newsGrid');
    const catClass = { game: 'cat-game', tech: 'cat-tech', ai: 'cat-ai' };

    grid.innerHTML = items.map(item => `
        <a class="news-card" href="${item.link || '#'}" target="_blank" rel="noopener">
            <span class="news-category ${catClass[item.category] || 'cat-tech'}">${item.categoryName}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.desc)}</p>
            <div class="news-meta">
                <span class="news-source">${escapeHtml(item.source)}</span>
                <span>${escapeHtml(item.date)}</span>
            </div>
        </a>
    `).join('');

    // Re-observe new elements for scroll reveal
    grid.querySelectorAll('.news-card').forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * 0.08}s`;
        observer.observe(el);
    });
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch {
        return dateStr;
    }
}

// Load news on page load
loadNews();

// ========== Console Easter Egg ==========
console.log('%c欢迎来到老鹏的个人网站！', 'font-size: 20px; color: #8b5cf6; font-weight: bold;');
console.log('%c联系邮箱: 105945357@qq.com', 'font-size: 14px; color: #888;');
