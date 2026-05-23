/*
 * nebula-decor.js - 星云装饰动画
 * 用于右上和左下对角区域，配合银河系动画
 */

(function() {
    'use strict';

    const CONFIG = {
        nebulaCount: 8,          // 星云数量
        particleCount: 120,      // 星尘粒子数量
        colors: [
            [138, 43, 226],      // 蓝紫色
            [75, 0, 130],        // 靛蓝
            [147, 112, 219],     // 淡紫色
            [186, 85, 211],      // 中紫色
            [123, 104, 238],     // 中石板蓝
        ],
    };

    let canvas, ctx, w, h;
    let animId = null;
    let time = 0;
    let nebulae = [];
    let particles = [];

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'nebula-canvas';
        canvas.style.cssText = `
            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            opacity: 0.6;
            z-index: 1;
        `;

        const hero = document.getElementById('hero');
        if (!hero) return;

        const heroBg = hero.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.after(canvas);
        } else {
            hero.insertBefore(canvas, hero.firstChild);
        }

        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        createNebulae();
        createParticles();
        animate();
    }

    function resize() {
        const hero = document.getElementById('hero');
        w = hero.offsetWidth;
        h = hero.offsetHeight;
        canvas.width = w;
        canvas.height = h;
        if (nebulae.length) createNebulae();
        if (particles.length) createParticles();
    }

    // 创建星云（大范围柔和光晕）
    function createNebulae() {
        nebulae = [];
        for (let i = 0; i < CONFIG.nebulaCount; i++) {
            const corner = i < 4 ? 'bottom-left' : 'top-right';
            let x, y;

            if (corner === 'bottom-left') {
                x = Math.random() * w * 0.4;
                y = h * 0.6 + Math.random() * h * 0.4;
            } else {
                x = w * 0.6 + Math.random() * w * 0.4;
                y = Math.random() * h * 0.4;
            }

            nebulae.push({
                x: x,
                y: y,
                r: 80 + Math.random() * 150,
                color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
                alpha: 0.03 + Math.random() * 0.05,
                speed: 0.002 + Math.random() * 0.004,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    // 创建星尘粒子
    function createParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const corner = Math.random() < 0.5 ? 'bottom-left' : 'top-right';
            let x, y;

            if (corner === 'bottom-left') {
                x = Math.random() * w * 0.45;
                y = h * 0.55 + Math.random() * h * 0.45;
            } else {
                x = w * 0.55 + Math.random() * w * 0.45;
                y = Math.random() * h * 0.45;
            }

            particles.push({
                x: x,
                y: y,
                r: 0.5 + Math.random() * 1.5,
                color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
                alpha: 0.2 + Math.random() * 0.5,
                speed: 0.003 + Math.random() * 0.01,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        time++;

        // 绘制星云
        nebulae.forEach(n => {
            const pulse = 0.7 + 0.3 * Math.sin(time * n.speed + n.phase);
            const alpha = n.alpha * pulse;

            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            grad.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${alpha})`);
            grad.addColorStop(0.5, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${alpha * 0.5})`);
            grad.addColorStop(1, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 绘制星尘粒子
        particles.forEach(p => {
            const twinkle = 0.4 + 0.6 * Math.sin(time * p.speed + p.phase);
            const alpha = p.alpha * twinkle;

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
            grad.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`);
            grad.addColorStop(1, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            ctx.fill();

            // 核心亮点
            ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${Math.min(alpha * 1.5, 1)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        animId = requestAnimationFrame(animate);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.NebulaDecor = {
        stop: () => { if (animId) cancelAnimationFrame(animId); },
        start: () => { animate(); }
    };
})();
