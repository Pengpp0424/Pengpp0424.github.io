/* 
 * scroll-control.js - 全站视频优先级与互斥控制
 * 
 * 规则：
 * 1. 《零》播放优先级最高（默认播放）
 * 2. 滚动到游戏科技板块 → 暂停《零》，播放B站视频
 * 3. 离开游戏科技板块 → 暂停B站，恢复《零》
 * 4. 点击任何视频 → 暂停其他所有正在播放的视频
 */

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        threshold: 0.4,     // 板块可见40%时触发
        debug: false        // 调试模式
    };

    // ========== 状态 ==========
    let newsSection, newsVideo, zeroIframe;
    let observer = null;

    // ========== 初始化 ==========
    function init() {
        newsSection = document.getElementById('news');
        newsVideo = document.getElementById('newsVideo');
        zeroIframe = document.querySelector('#works iframe');

        if (!newsSection) { log('❌ 找不到 #news'); return; }
        if (!newsVideo) { log('❌ 找不到 #newsVideo'); return; }

        // 确保 B站新闻视频不自动播放（只有滚动到才播放）
        ensureNotAutoplay(newsVideo);

        // 确保《零》自动播放
        if (zeroIframe) {
            ensureAutoplay(zeroIframe);
        }

        // 设置点击互斥（点击任何视频暂停其他）
        setupClickMutex();

        // 设置滚动观察
        setupObserver();

        log('✅ 全站视频控制已初始化');
    }

    // ========== 确保B站iframe不自动播放 ==========
    function ensureNotAutoplay(iframe) {
        try {
            const src = iframe.src;
            if (src.includes('autoplay=1')) {
                iframe.src = src.replace('autoplay=1', 'autoplay=0');
                log('✅ 已将新闻视频设为不自动播放');
            }
        } catch(e) {
            log('⚠️ 修改新闻视频src失败: ' + e.message);
        }
    }

    // ========== 确保《零》自动播放 ==========
    function ensureAutoplay(iframe) {
        try {
            const src = iframe.src;
            if (!src.includes('autoplay=1')) {
                iframe.src = src.replace('autoplay=0', 'autoplay=1');
                log('✅ 已确保《零》自动播放');
            }
        } catch(e) {
            log('⚠️ 修改《零》src失败: ' + e.message);
        }
    }

    // ========== 设置滚动观察 ==========
    function setupObserver() {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    log('📥 进入"游戏科技动态"板块');
                    onEnterNews();
                } else {
                    log('📤 离开"游戏科技动态"板块');
                    onLeaveNews();
                }
            });
        }, { threshold: CONFIG.threshold });

        observer.observe(newsSection);
        log('✅ Intersection Observer 已启动');
    }

    // ========== 进入游戏科技板块 ==========
    function onEnterNews() {
        // 1. 暂停《零》
        pauseIframe(zeroIframe, '《零》');

        // 2. 播放新闻视频
        playIframe(newsVideo, '游戏科技');
    }

    // ========== 离开游戏科技板块 ==========
    function onLeaveNews() {
        // 1. 暂停新闻视频
        pauseIframe(newsVideo, '游戏科技');

        // 2. 恢复播放《零》
        playIframe(zeroIframe, '《零》');
    }

    // ========== 通用：播放B站iframe ==========
    function playIframe(iframe, label) {
        if (!iframe || !iframe.contentWindow) {
            log('⚠️ ' + label + ' iframe 未就绪');
            return;
        }
        try {
            iframe.contentWindow.postMessage('{"command":"play"}', '*');
            log('▶️ 播放 ' + label);
        } catch(e) {
            log('❌ 播放 ' + label + ' 失败: ' + e.message);
        }
    }

    // ========== 通用：暂停B站iframe ==========
    function pauseIframe(iframe, label) {
        if (!iframe || !iframe.contentWindow) {
            log('⚠️ ' + label + ' iframe 未就绪');
            return;
        }
        try {
            iframe.contentWindow.postMessage('{"command":"pause"}', '*');
            log('⏸️ 暂停 ' + label);
        } catch(e) {
            log('❌ 暂停 ' + label + ' 失败: ' + e.message);
        }
    }

    // ========== 点击互斥：点击任何视频，暂停其他所有 ==========
    function setupClickMutex() {
        // 监听所有 iframe 的父容器点击
        document.addEventListener('click', (e) => {
            const clickedEmbed = e.target.closest('.work-embed') || e.target.closest('.news-video-left');
            if (!clickedEmbed) return;

            const clickedIframe = clickedEmbed.querySelector('iframe');
            if (!clickedIframe) return;

            log('🖱️ 点击视频: ' + (clickedIframe === newsVideo ? '游戏科技' : '作品'));

            // 暂停所有其他 iframe
            pauseAllExcept(clickedIframe);
        });

        log('✅ 点击互斥已设置');
    }

    // ========== 暂停除指定iframe外的所有视频 ==========
    function pauseAllExcept(exceptIframe) {
        // 所有作品 iframe（《零》等）
        const workIframes = document.querySelectorAll('#works iframe');
        workIframes.forEach(iframe => {
            if (iframe !== exceptIframe) {
                pauseIframe(iframe, '作品');
            }
        });

        // 新闻视频 iframe
        if (newsVideo && newsVideo !== exceptIframe) {
            pauseIframe(newsVideo, '游戏科技');
        }
    }

    // ========== 工具 ==========
    function log(msg) {
        if (CONFIG.debug) console.log('[VideoControl] ' + msg);
    }

    // ========== 启动 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.VideoControl = {
        playIframe: playIframe,
        pauseIframe: pauseIframe,
        pauseAllExcept: pauseAllExcept,
        setDebug: (v) => { CONFIG.debug = v; }
    };
})();
