/*
 * starlight.js - 全站板块依稀星光闪烁效果
 * 用法：自动在所有 .section / .hero / .section-dark 背景注入星光
 * 风格：极淡、稀疏、缓慢闪烁，不抢主体视觉
 */

(function() {
    'use strict';

    const CONFIG = {
        starsPerSection: 35,       // 每个板块星星数量（稀疏！）
        minRadius: 0.3,            // 最小星光半径
        maxRadius: 1.6,            // 最大星光半径
        minAlpha: 0.03,            // 最低透明度（依稀）
        maxAlpha: 0.18,            // 最高透明度（依稀）
        twinkleSpeedMin: 0.003,     // 最慢闪烁速度
        twinkleSpeedMax: 0.025,     // 最快闪烁速度
        colorPalette: [              // 星光颜色（冷色系）
            'rgba(180, 210, 255,',  // 淡蓝白
            'rgba(200, 180, 255,',  // 淡紫白
            'rgba(180, 255, 240,',  // 淡青
            'rgba(255, 240, 220,',  // 暖白
            'rgba(220, 200, 255,'   // 淡薰衣草
        ],
        bgFillAlpha: 0.06,         // 每帧背景覆盖透明度（制造拖尾）
    };

    let canvases = [];  // { canvas, ctx, stars, w, h }
    let globalTime = 0;
    let animId = null;

    function init() {
        const sections = document.querySelectorAll('.hero, .section, .section-dark');
        if (!sections.length) {
            console.warn('[Starlight] 未找到任何板块');
            return;
        }

        sections.forEach((sec, idx) => {
            const cv = document.createElement('canvas');
            cv.id = 'starlight-canvas-' + idx;
            cv.style.cssText = `
                position: absolute;
                left: 0; top: 0;
                width: 100%; height: 100%;
                z-index: 2;
                pointer-events: none;
                opacity: 1.0;
            `;

            // 插入板块最底层
            sec.style.position = 'relative';
            sec.style.overflow = 'hidden';
            sec.insertBefore(cv, sec.firstChild);

            const c = cv.getContext('2d');
            const stars = buildStars(sec);

            canvases.push({ canvas: cv, ctx: c, stars: stars, w: 0, h: 0 });
        });

        resizeAll();
        window.addEventListener('resize', resizeAll);

        animate();
        console.log('[Starlight] 已注入 ' + canvases.length + ' 个板块');
    }

    function buildStars(section) {
        const w = section.offsetWidth || window.innerWidth;
        const h = section.offsetHeight || window.innerHeight;
        const arr = [];
        for (let i = 0; i < CONFIG.starsPerSection; i++) {
            arr.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
                baseAlpha: CONFIG.minAlpha + Math.random() * (CONFIG.maxAlpha - CONFIG.minAlpha),
                speed: CONFIG.twinkleSpeedMin + Math.random() * (CONFIG.twinkleSpeedMax - CONFIG.twinkleSpeedMin),
                phase: Math.random() * Math.PI * 2,
                colorIdx: Math.floor(Math.random() * CONFIG.colorPalette.length),
                // 偶尔来个稍亮的星（5% 概率）
                bright: Math.random() < 0.05
            });
        }
        return arr;
    }

    function resizeAll() {
        canvases.forEach(item => {
            const sec = item.canvas.parentElement;
            const w = sec.offsetWidth;
            const h = sec.offsetHeight;
            if (w === item.w && h === item.h) return;
            item.w = w;
            item.h = h;
            item.canvas.width = w;
            item.canvas.height = h;
            // 重新分布星星位置
            item.stars.forEach(s => {
                s.x = Math.random() * w;
                s.y = Math.random() * h;
            });
        });
    }

    function animate() {
        globalTime++;

        canvases.forEach(item => {
            const { ctx, stars, w, h } = item;

            // 半透明覆盖（制造拖尾 / 缓慢消失）
            ctx.fillStyle = `rgba(2, 4, 12, ${CONFIG.bgFillAlpha})`;
            ctx.fillRect(0, 0, w, h);

            stars.forEach(s => {
                // 闪烁：用 sin 控制透明度
                const twinkle = 0.5 + 0.5 * Math.sin(globalTime * s.speed + s.phase);
                let alpha = s.baseAlpha * twinkle;

                // 偶尔亮星
                if (s.bright && twinkle > 0.7) {
                    alpha = Math.min(alpha * 2.8, CONFIG.maxAlpha * 2.5);
                }

                const colorBase = CONFIG.colorPalette[s.colorIdx];
                const alphaHex = Math.round(Math.min(alpha, 1) * 255).toString(16).padStart(2, '0');

                // 柔光（径向渐变）
                const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
                grad.addColorStop(0, colorBase + alphaHex + ')');
                grad.addColorStop(0.5, colorBase + Math.round(alpha * 0.4 * 255).toString(16).padStart(2, '0') + ')');
                grad.addColorStop(1, colorBase + '00)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
                ctx.fill();

                // 核心亮点
                ctx.fillStyle = colorBase + Math.round(alpha * 0.9 * 255).toString(16).padStart(2, '0') + ')';
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        animId = requestAnimationFrame(animate);
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.Starlight = {
        stop: () => { if (animId) cancelAnimationFrame(animId); },
        start: () => { animate(); },
        reload: () => { init(); }
    };
})();
