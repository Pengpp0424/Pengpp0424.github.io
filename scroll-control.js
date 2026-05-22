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
    let newsSection, newsVideo, zeroVideos;
    let observer = null;
    let isPlayingNews = false;

    // ========== 初始化 ==========
    function init() {
        // 获取 DOM 元素
        newsSection = document.getElementById('news');
        newsVideo = document.getElementById('newsVideo');
        zeroVideos = document.querySelectorAll('.hero-anim video');

        // 检查必要元素
        if (!newsSection) {
            log('❌ 找不到 #news 板块');
            return;
        }
        if (!newsVideo) {
            log('❌ 找不到 #newsVideo iframe');
            return;
        }
        if (!zeroVideos || zeroVideos.length === 0) {
            log('⚠️ 找不到 .hero-anim video（《零》视频）');
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

    // ========== 暂停《零》视频 ==========
    function pauseZeroVideo() {
        if (!zeroVideos || zeroVideos.length === 0) {
            log('⚠️ 没有找到《零》视频');
            return;
        }

        zeroVideos.forEach((video, index) => {
            if (!video.paused) {
                video.pause();
                log(`⏸️ 暂停《零》视频 [${index}]`);
            }
        });
    }

    // ========== 恢复播放《零》视频 ==========
    function resumeZeroVideo() {
        if (!zeroVideos || zeroVideos.length === 0) {
            log('⚠️ 没有找到《零》视频');
            return;
        }

        zeroVideos.forEach((video, index) => {
            // 只有之前在播放的才恢复
            video.play().then(() => {
                log(`▶️ 恢复播放《零》视频 [${index}]`);
            }).catch(err => {
                log(`❌ 恢复播放失败 [${index}]: ${err.message}`);
            });
        });
    }

    // ========== 播放 B站视频 ==========
    function playNewsVideo() {
        if (!newsVideo || !newsVideo.contentWindow) {
            log('❌ B站 iframe 未就绪');
            return;
        }

        try {
            // B站播放器 API：发送 play 命令
            newsVideo.contentWindow.postMessage('{"command":"play"}', '*');
            log('▶️ 播放 B站视频');
        } catch (err) {
            log(`❌ 播放 B站视频失败: ${err.message}`);
        }
    }

    // ========== 暂停 B站视频 ==========
    function pauseNewsVideo() {
        if (!newsVideo || !newsVideo.contentWindow) {
            log('❌ B站 iframe 未就绪');
            return;
        }

        try {
            // B站播放器 API：发送 pause 命令
            newsVideo.contentWindow.postMessage('{"command":"pause"}', '*');
            log('⏸️ 暂停 B站视频');
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
