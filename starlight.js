/*
 * starlight.js - 全局背景星光闪烁效果
 * 用法：创建一个fixed定位的canvas覆盖整个页面背景
 * 风格：极淡、稀疏、缓慢闪烁，不抢主体视觉
 */

(function() {
    'use strict';

    const CONFIG = {
        starCount: 200,           // 全局星星数量
        minRadius: 0.5,           // 最小星光半径
        maxRadius: 2.0,           // 最大星光半径
        minAlpha: 0.05,           // 最低透明度（依稀）
        maxAlpha: 0.4,            // 最高透明度（依稀）
        twinkleSpeedMin: 0.002,   // 最慢闪烁速度
        twinkleSpeedMax: 0.015,   // 最快闪烁速度
        colors: [                  // 星光颜色（冷色系）
            '#ffffff',             // 纯白
            '#e0e7ff',             // 淡蓝白
            '#c7d2fe',             // 淡紫白
            '#a5b4fc',             // 淡蓝紫
            '#818cf8',             // 蓝紫
            '#c4b5fd',             // 淡紫
            '#67e8f9',             // 淡青
            '#a5f3fc'              // 青白
        ],
        parallaxFactor: 0.01      // 视差系数（随滚动轻微移动）
    };

    let canvas, ctx, stars = [];
    let scrollY = 0;
    let animId = null;

    function createGlobalCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'starlight-global';
        canvas.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);
        ctx = canvas.getContext('2d');
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildStars();
    }

    function buildStars() {
        stars = [];
        const docHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            window.innerHeight
        );

        for (let i = 0; i < CONFIG.starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * docHeight,  // 分布在整个文档高度
                radius: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
                color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
                baseAlpha: CONFIG.minAlpha + Math.random() * (CONFIG.maxAlpha - CONFIG.minAlpha),
                phase: Math.random() * Math.PI * 2,
                speed: CONFIG.twinkleSpeedMin + Math.random() * (CONFIG.twinkleSpeedMax - CONFIG.twinkleSpeedMin)
            });
        }
    }

    function animate() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now();

        stars.forEach(star => {
            // 计算可见位置（视差偏移）
            const offsetY = star.y - scrollY * CONFIG.parallaxFactor;
            
            // 只绘制屏幕内的星（加一些缓冲）
            if (offsetY > -50 && offsetY < canvas.height + 50) {
                // 闪烁
                const twinkle = 0.5 + 0.5 * Math.sin(time * star.speed + star.phase);
                const alpha = star.baseAlpha * twinkle;

                // 柔光渐变
                const gradient = ctx.createRadialGradient(
                    star.x, offsetY, 0,
                    star.x, offsetY, star.radius * 3
                );
                gradient.addColorStop(0, star.color);
                gradient.addColorStop(1, 'transparent');

                ctx.globalAlpha = alpha;
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(star.x, offsetY, star.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // 核心亮点
                ctx.globalAlpha = alpha * 1.2;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(star.x, offsetY, star.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = 1;
            }
        });

        animId = requestAnimationFrame(animate);
    }

    function init() {
        createGlobalCanvas();
        resize();
        
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
        });

        animate();
        console.log('[Starlight] 全局星光已启动，共 ' + stars.length + ' 颗星');
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.Starlight = {
        reload: resize,
        stop: () => { if (animId) cancelAnimationFrame(animId); },
        start: () => { animate(); }
    };
})();
