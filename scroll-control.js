/* 
 * scroll-control.js - 游戏科技动态板块滚动控制视频
 * 功能：
 * 1. 滚动到"游戏科技动态"板块时，暂停《零》视频，播放 B站视频
 * 2. 离开板块时，暂停 B站视频，恢复播放《零》
 */

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        threshold: 0.5,  // 板块可见 50% 时触发
        debug: false       // 调试模式（控制台输出日志）
    };

    // ========== 状态 ==========
    let newsSection, newsVideo, zeroIframe;
    let observer = null;
    let isPlayingNews = false;

    // ========== 初始化 ==========
    function init() {
        // 获取 DOM 元素
        newsSection = document.getElementById('news');
        newsVideo = document.getElementById('newsVideo');
        zeroIframe = document.querySelector('#works iframe');  // 《零》在"精选作品"板块

        // 检查必要元素
        if (!newsSection) {
            log('❌ 找不到 #news 板块');
            return;
        }
        if (!newsVideo) {
            log('❌ 找不到 #newsVideo iframe');
            return;
        }
        if (!zeroIframe) {
            log('⚠️ 找不到 #works iframe（《零》视频）');
        }

        // 等待 B站 iframe 加载完成
        newsVideo.addEventListener('load', () => {
            log('✅ B站 iframe 加载完成');
            setupObserver();
        });

        // 如果 iframe 已经加载完成（缓存情况）
        if (newsVideo.contentDocument || newsVideo.contentWindow) {
            log('✅ B站 iframe 已加载（缓存）');
            setupObserver();
        } else {
            // 设置超时兜底（10 秒后强制初始化）
            setTimeout(() => {
                log('⚠️ 超时兜底：强制初始化 Observer');
                setupObserver();
            }, 10000);
        }
    }

    // ========== 设置 Intersection Observer ==========
    function setupObserver() {
        // 创建 Observer
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 进入视口
                    log('📥 进入"游戏科技动态"板块');
                    onEnterNews();
                } else {
                    // 离开视口
                    log('📤 离开"游戏科技动态"板块');
                    onLeaveNews();
                }
            });
        }, { threshold: CONFIG.threshold });

        // 开始观察
        observer.observe(newsSection);
        log('✅ Intersection Observer 已启动');
    }

    // ========== 进入板块 ==========
    function onEnterNews() {
        // 暂停《零》视频
        pauseZeroVideo();

        // 播放 B站视频
        playNewsVideo();

        isPlayingNews = true;
    }

    // ========== 离开板块 ==========
    function onLeaveNews() {
        // 暂停 B站视频
        pauseNewsVideo();

        // 恢复播放《零》视频
        resumeZeroVideo();

        isPlayingNews = false;
    }

    // ========== 暂停《零》视频（B站 iframe） ==========
    function pauseZeroVideo() {
        if (!zeroIframe || !zeroIframe.contentWindow) {
            log('⚠️ 《零》iframe 未就绪');
            return;
        }

        try {
            zeroIframe.contentWindow.postMessage('{"command":"pause"}', '*');
            log('⏸️ 暂停《零》视频 (B站 iframe)');
        } catch (err) {
            log(`❌ 暂停《零》失败: ${err.message}`);
        }
    }

    // ========== 恢复播放《零》视频（B站 iframe） ==========
    function resumeZeroVideo() {
        if (!zeroIframe || !zeroIframe.contentWindow) {
            log('⚠️ 《零》iframe 未就绪');
            return;
        }

        try {
            zeroIframe.contentWindow.postMessage('{"command":"play"}', '*');
            log('▶️ 恢复播放《零》视频 (B站 iframe)');
        } catch (err) {
            log(`❌ 恢复播放《零》失败: ${err.message}`);
        }
    }

    // ========== 播放 B站视频 ==========
    function playNewsVideo() {
        if (!newsVideo) {
            log('❌ B站 iframe 未就绪');
            return;
        }

        try {
            // 方法1：重载 iframe，添加 autoplay=1
            const baseSrc = newsVideo.src.split('&autoplay=')[0].split('?autoplay=')[0];
            const separator = baseSrc.includes('?') ? '&' : '?';
            newsVideo.src = baseSrc + separator + 'autoplay=1&muted=1';
            log('▶️ 播放 B站视频 (重载 iframe, autoplay=1)');
        } catch (err) {
            log(`❌ 播放 B站视频失败: ${err.message}`);
        }
    }

    // ========== 暂停 B站视频 ==========
    function pauseNewsVideo() {
        if (!newsVideo) {
            log('❌ B站 iframe 未就绪');
            return;
        }

        try {
            // 方法1：重载 iframe，改回 autoplay=0
            const baseSrc = newsVideo.src.split('&autoplay=')[0].split('?autoplay=')[0];
            const separator = baseSrc.includes('?') ? '&' : '?';
            newsVideo.src = baseSrc + separator + 'autoplay=0';
            log('⏸️ 暂停 B站视频 (重载 iframe, autoplay=0)');
        } catch (err) {
            log(`❌ 暂停 B站视频失败: ${err.message}`);
        }
    }

    // ========== 工具函数 ==========
    function log(message) {
        if (CONFIG.debug) {
            console.log(`[ScrollControl] ${message}`);
        }
    }

    // ========== 启动 ==========
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 导出（可选）
    window.ScrollControl = {
        pauseZero: pauseZeroVideo,
        resumeZero: resumeZeroVideo,
        playNews: playNewsVideo,
        pauseNews: pauseNewsVideo,
        setDebug: function(enabled) {
            CONFIG.debug = enabled;
            console.log(`[ScrollControl] 调试模式: ${enabled ? '开启' : '关闭'}`);
        }
    };
})();
