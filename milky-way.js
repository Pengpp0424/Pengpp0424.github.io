/*
 * milky-way.js - Hero 区银河系斜对角动画
 * 替代左上右下两个椭圆光晕
 * 风格：从左下到右上的斜对角银河带，发光星尘+淡紫蓝色调
 */

(function() {
    'use strict';

    const CONFIG = {
        starCount: 180,           // 银河带内星尘数量
        dustCount: 60,            // 弥漫尘埃数量
        bandWidth: 0.28,          // 银河带宽占比（相对短边）
        angle: -35,               // 斜对角角度（度），负值=左下到右上
        colors: [
            [100, 140, 255],      // 蓝白
            [160, 120, 255],      // 淡紫
            [180, 160, 255],      // 薰衣草
            [120, 180, 255],      // 天蓝
            [200, 180, 255],      // 浅紫
            [80, 160, 220],       // 深蓝
        ],
        bgAlpha: 0.04,            // 每帧背景覆盖（慢拖尾）
        coreAlpha: 0.22,          // 银河核心亮度
        starMinAlpha: 0.1,
        starMaxAlpha: 0.7,
        twinkleMin: 0.005,
        twinkleMax: 0.04,
    };

    let canvas, ctx, w, h;
    let animId = null;
    let time = 0;
    let stars = [];
    let dusts = [];

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'milky-way-canvas';
        canvas.style.cssText = `
            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0.5;
        `;

        const hero = document.getElementById('hero');
        if (!hero) return;

        // 插入到 hero-bg 之后
        const heroBg = hero.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.after(canvas);
        } else {
            hero.insertBefore(canvas, hero.firstChild);
        }

        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        createStars();
        createDust();
        animate();
    }

    function resize() {
        const hero = document.getElementById('hero');
        w = hero.offsetWidth;
        h = hero.offsetHeight;
        canvas.width = w;
        canvas.height = h;
        // 重新分布星星
        if (stars.length) createStars();
        if (dusts.length) createDust();
    }

    // 判断点是否在银河带内
    function inBand(x, y) {
        const rad = CONFIG.angle * Math.PI / 180;
        // 银河带中心线: 从左下到右上
        // 沿法线方向的距离
        const nx = -Math.sin(rad);
        const ny = Math.cos(rad);
        // 归一化到对角线长度
        const diagLen = Math.sqrt(w * w + h * h);
        const dist = (x * nx + y * ny) / diagLen;
        const halfBand = CONFIG.bandWidth / 2;
        return Math.abs(dist - 0) < halfBand;
    }

    // 获取银河带内的随机位置
    function randomBandPos() {
        const rad = CONFIG.angle * Math.PI / 180;
        const diagLen = Math.sqrt(w * w + h * h);
        const halfBand = CONFIG.bandWidth / 2;

        // 沿银河方向的参数 t (0~1)
        const t = Math.random();
        // 沿法线方向的偏移（高斯分布集中在中心）
        const u = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;  // 近似高斯
        const offset = u * halfBand * 2;

        // 方向向量
        const dx = Math.cos(rad);
        const dy = Math.sin(rad);
        const nx = -Math.sin(rad);
        const ny = Math.cos(rad);

        const cx = -diagLen * 0.3 * dx + t * diagLen * 1.6 * dx + offset * diagLen * nx;
        const cy = -diagLen * 0.3 * dy + t * diagLen * 1.6 * dy + offset * diagLen * ny;

        return { x: cx, y: cy };
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < CONFIG.starCount; i++) {
            const pos = randomBandPos();
            const colorIdx = Math.floor(Math.random() * CONFIG.colors.length);
            stars.push({
                x: pos.x,
                y: pos.y,
                r: 0.3 + Math.random() * 1.2,
                baseAlpha: CONFIG.starMinAlpha + Math.random() * (CONFIG.starMaxAlpha - CONFIG.starMinAlpha),
                speed: CONFIG.twinkleMin + Math.random() * (CONFIG.twinkleMax - CONFIG.twinkleMin),
                phase: Math.random() * Math.PI * 2,
                color: CONFIG.colors[colorIdx],
            });
        }
    }

    function createDust() {
        dusts = [];
        for (let i = 0; i < CONFIG.dustCount; i++) {
            const pos = randomBandPos();
            dusts.push({
                x: pos.x,
                y: pos.y,
                r: 15 + Math.random() * 40,
                alpha: 0.01 + Math.random() * 0.03,
                color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
            });
        }
    }

    function animate() {
        // 半透明覆盖（慢拖尾）
        ctx.fillStyle = `rgba(2, 4, 12, ${CONFIG.bgAlpha})`;
        ctx.fillRect(0, 0, w, h);

        time++;

        // 绘制弥漫尘埃（底层）
        dusts.forEach(d => {
            const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
            grad.addColorStop(0, `rgba(${d.color[0]}, ${d.color[1]}, ${d.color[2]}, ${d.alpha})`);
            grad.addColorStop(1, `rgba(${d.color[0]}, ${d.color[1]}, ${d.color[2]}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 绘制星尘
        stars.forEach(s => {
            const twinkle = 0.4 + 0.6 * Math.sin(time * s.speed + s.phase);
            const alpha = s.baseAlpha * twinkle;

            // 柔光
            const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
            grad.addColorStop(0, `rgba(${s.color[0]}, ${s.color[1]}, ${s.color[2]}, ${alpha})`);
            grad.addColorStop(1, `rgba(${s.color[0]}, ${s.color[1]}, ${s.color[2]}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
            ctx.fill();

            // 核心亮点
            ctx.fillStyle = `rgba(${s.color[0]}, ${s.color[1]}, ${s.color[2]}, ${Math.min(alpha * 1.5, 1)})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });

        animId = requestAnimationFrame(animate);
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.MilkyWay = {
        stop: () => { if (animId) cancelAnimationFrame(animId); },
        start: () => { animate(); }
    };
})();
