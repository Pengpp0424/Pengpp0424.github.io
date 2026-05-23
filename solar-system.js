/*
 * solar-system.js - Hero 区太阳系星球动画
 * 位置：标题上方，赛博动画下方
 * 风格：科幻风，发光行星+轨道
 */

(function() {
    'use strict';

    const CONFIG = {
        sunRadius: 22,
        sunGlow: 40,
        planets: [
            { name: '水星', radius: 4,  distance: 60,  speed: 0.025, color: '#b0b0b0', trail: 20 },
            { name: '金星', radius: 6,  distance: 95,  speed: 0.018, color: '#e8cda0', trail: 25 },
            { name: '地球', radius: 7,  distance: 138, speed: 0.014, color: '#4da6ff', trail: 30 },
            { name: '火星', radius: 5,  distance: 180, speed: 0.011, color: '#e07040', trail: 35 },
            { name: '木星', radius: 14, distance: 255, speed: 0.006, color: '#d4a56a', trail: 40 },
            { name: '土星', radius: 12, distance: 330, speed: 0.004, color: '#e8d088', hasRing: true, trail: 45 },
        ],
        bgAlpha: 0.08,
        glowPasses: 3
    };

    let canvas, ctx, w, h, cx, cy;
    let animId = null;
    let time = 0;

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'solar-system-canvas';
        canvas.style.cssText = `
            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0.55;
        `;

        const hero = document.getElementById('hero');
        if (!hero) return;

        // 插入到 .hero-bg 之后、.hero-content 之前
        const heroBg = hero.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.after(canvas);
        } else {
            hero.insertBefore(canvas, hero.firstChild);
        }

        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        animate();
    }

    function resize() {
        const hero = document.getElementById('hero');
        w = hero.offsetWidth;
        h = hero.offsetHeight;
        canvas.width = w;
        canvas.height = h;
        cx = w * 0.5;
        cy = h * 0.38;   // 偏上，在标题上方
    }

    function animate() {
        // 半透明覆盖，制造拖尾
        ctx.fillStyle = `rgba(3, 6, 18, ${CONFIG.bgAlpha})`;
        ctx.fillRect(0, 0, w, h);

        time += 1;

        drawSun();
        CONFIG.planets.forEach(p => drawPlanet(p));

        animId = requestAnimationFrame(animate);
    }

    function drawSun() {
        // 外层光晕（多层）
        for (let i = CONFIG.glowPasses; i >= 1; i--) {
            const r = CONFIG.sunGlow * (i / CONFIG.glowPasses);
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            grad.addColorStop(0, `rgba(255, 200, 60, ${0.012 * i})`);
            grad.addColorStop(0.5, `rgba(255, 160, 20, ${0.006 * i})`);
            grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // 太阳核心
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, CONFIG.sunRadius);
        coreGrad.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
        coreGrad.addColorStop(0.5, 'rgba(255, 200, 60, 0.8)');
        coreGrad.addColorStop(1, 'rgba(255, 140, 20, 0.4)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, CONFIG.sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // 表面闪烁
        const flicker = 0.85 + 0.15 * Math.sin(time * 0.08);
        ctx.fillStyle = `rgba(255, 255, 220, ${0.25 * flicker})`;
        ctx.beginPath();
        ctx.arc(cx, cy, CONFIG.sunRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawPlanet(p) {
        const angle = time * p.speed;
        const px = cx + Math.cos(angle) * p.distance;
        const py = cy + Math.sin(angle) * p.distance;

        // 轨道线（极淡）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, p.distance, 0, Math.PI * 2);
        ctx.stroke();

        // 拖尾
        for (let i = p.trail; i >= 1; i--) {
            const ta = angle - i * 0.012;
            const tx = cx + Math.cos(ta) * p.distance;
            const ty = cy + Math.sin(ta) * p.distance;
            const alpha = (1 - i / p.trail) * 0.15;
            ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(tx, ty, p.radius * (1 - i / p.trail * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }

        // 行星光晕
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 2.8);
        glowGrad.addColorStop(0, p.color + '40');
        glowGrad.addColorStop(0.5, p.color + '15');
        glowGrad.addColorStop(1, p.color + '00');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // 行星本体
        const planetGrad = ctx.createRadialGradient(px - p.radius * 0.3, py - p.radius * 0.3, 0, px, py, p.radius);
        planetGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
        planetGrad.addColorStop(0.4, p.color + 'cc');
        planetGrad.addColorStop(1, p.color + '66');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // 土星环
        if (p.hasRing) {
            ctx.strokeStyle = 'rgba(232, 208, 136, 0.35)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(px, py, p.radius * 2.2, p.radius * 0.6, -0.2, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 高光点
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(px - p.radius * 0.3, py - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SolarSystem = {
        stop: () => { if (animId) cancelAnimationFrame(animId); },
        start: () => { animate(); }
    };
})();
