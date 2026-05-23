/*
 * starlight.js - 全局背景星光闪烁效果
 * 用法：创建一个fixed定位的canvas覆盖整个页面背景
 * 风格：真实夜空星光，有发光晕染，在灰色和黑色区域都可见
 */

(function() {
    'use strict';

    const CONFIG = {
        starCount: 250,           // 全局星星数量
        minRadius: 1.0,           // 最小星光半径
        maxRadius: 3.5,           // 最大星光半径
        minAlpha: 0.15,           // 最低透明度
        maxAlpha: 0.9,            // 最高透明度
        glowRadius: 4,            // 发光晕染半径倍数
        twinkleSpeedMin: 0.001,   // 最慢闪烁速度
        twinkleSpeedMax: 0.012,   // 最快闪烁速度
        colors: [                  // 星光颜色（带发光）
            { r: 255, g: 255, b: 255 },  // 纯白
            { r: 230, g: 240, b: 255 },  // 冷白
            { r: 200, g: 220, b: 255 },  // 淡蓝白
            { r: 180, g: 200, b: 255 },  // 蓝白
            { r: 220, g: 200, b: 255 },  // 淡紫白
            { r: 200, g: 180, b: 255 },  // 紫白
            { r: 255, g: 245, b: 230 },  // 暖白
            { r: 180, g: 255, b: 240 },  // 淡青
        ],
        parallaxFactor: 0.008,    // 视差系数
        brightStarChance: 0.08    // 亮星概率
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
            const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            const isBright = Math.random() < CONFIG.brightStarChance;
            
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * docHeight,
                radius: isBright 
                    ? 2.0 + Math.random() * (CONFIG.maxRadius - 2.0)
                    : CONFIG.minRadius + Math.random() * 1.5,
                color: color,
                baseAlpha: isBright 
                    ? 0.5 + Math.random() * (CONFIG.maxAlpha - 0.5)
                    : CONFIG.minAlpha + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2,
                speed: CONFIG.twinkleSpeedMin + Math.random() * (CONFIG.twinkleSpeedMax - CONFIG.twinkleSpeedMin),
                isBright: isBright
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now();

        stars.forEach(star => {
            // 视差偏移
            const offsetY = star.y - scrollY * CONFIG.parallaxFactor;
            
            // 只绘制屏幕内的星
            if (offsetY > -50 && offsetY < canvas.height + 50) {
                // 闪烁
                const twinkle = 0.5 + 0.5 * Math.sin(time * star.speed + star.phase);
                let alpha = star.baseAlpha * twinkle;

                // 亮星更亮
                if (star.isBright && twinkle > 0.6) {
                    alpha = Math.min(alpha * 1.5, CONFIG.maxAlpha);
                }

                const { r, g, b } = star.color;
                const glowSize = star.radius * CONFIG.glowRadius;

                // 外层发光晕染（柔和）
                const outerGlow = ctx.createRadialGradient(
                    star.x, offsetY, 0,
                    star.x, offsetY, glowSize * 2
                );
                outerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
                outerGlow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`);
                outerGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.fillStyle = outerGlow;
                ctx.beginPath();
                ctx.arc(star.x, offsetY, glowSize * 2, 0, Math.PI * 2);
                ctx.fill();

                // 内层发光（较亮）
                const innerGlow = ctx.createRadialGradient(
                    star.x, offsetY, 0,
                    star.x, offsetY, glowSize
                );
                innerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
                innerGlow.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
                innerGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                ctx.fillStyle = innerGlow;
                ctx.beginPath();
                ctx.arc(star.x, offsetY, glowSize, 0, Math.PI * 2);
                ctx.fill();

                // 核心亮点（最亮）
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(star.x, offsetY, star.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
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
