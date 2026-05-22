/* 
 * kaleidoscope.js - Hero 区万花筒几何变换动画
 * 颜色：深海蓝 + 水晶紫 + 反光效果
 * 位置：整个 Hero 区，不遮挡文字和视频
 */

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        symmetry: 6,                  // 对称性（6折万花筒）
        colors: {
            deepSea: ['#0f3460', '#16213e', '#1a1a2e', '#0a2647'],  // 深海蓝
            crystalPurple: ['#7b2d8e', '#9b59b6', '#8e44ad', '#6c3483'],  // 水晶紫
            glow: ['rgba(15,52,96,0.6)', 'rgba(123,45,142,0.6)', 'rgba(155,89,182,0.4)']  // 反光
        },
        shapeCount: 12,               // 每帧绘制的几何图形数量
        rotationSpeed: 0.002,         // 旋转速度
        pulseSpeed: 0.01,            // 脉动速度
        maxSize: 80,                  // 最大图形尺寸
        minSize: 10                   // 最小图形尺寸
    };

    // ========== 状态 ==========
    let canvas, ctx, width, height, centerX, centerY;
    let rotation = 0;
    let pulse = 0;
    let animationId = null;

    // ========== 初始化 ==========
    function init() {
        // 创建 Canvas
        canvas = document.createElement('canvas');
        canvas.id = 'kaleidoscope-canvas';
        canvas.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0.5;
        `;

        // 插入到 Hero 区（在 .hero-bg 之后，视频之前）
        const heroSection = document.getElementById('hero');
        const heroBg = heroSection.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.insertAdjacentElement('afterend', canvas);
        } else {
            heroSection.insertBefore(canvas, heroSection.firstChild);
        }

        // 获取绘图上下文
        ctx = canvas.getContext('2d');

        // 设置尺寸
        resize();
        window.addEventListener('resize', resize);

        // 开始动画
        animate();
    }

    // ========== 调整尺寸 ==========
    function resize() {
        const heroSection = document.getElementById('hero');
        width = heroSection.offsetWidth;
        height = heroSection.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        centerX = width / 2;
        centerY = height / 2;
    }

    // ========== 动画循环 ==========
    function animate() {
        // 清空画布（半透明，制造拖尾效果）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);

        // 更新状态
        rotation += CONFIG.rotationSpeed;
        pulse += CONFIG.pulseSpeed;

        // 保存上下文
        ctx.save();

        // 移动到中心点
        ctx.translate(centerX, centerY);

        // 绘制万花筒图案
        drawKaleidoscope();

        // 恢复上下文
        ctx.restore();

        // 下一帧
        animationId = requestAnimationFrame(animate);
    }

    // ========== 绘制万花筒 ==========
    function drawKaleidoscope() {
        const segmentAngle = (Math.PI * 2) / CONFIG.symmetry;

        for (let i = 0; i < CONFIG.symmetry; i++) {
            // 保存当前状态
            ctx.save();

            // 旋转到对应扇区
            ctx.rotate(segmentAngle * i);

            // 绘制几何图形
            drawGeometricShapes();

            // 镜像反射（制造万花筒效果）
            ctx.scale(1, -1);
            drawGeometricShapes();

            // 恢复状态
            ctx.restore();
        }
    }

    // ========== 绘制几何图形 ==========
    function drawGeometricShapes() {
        for (let i = 0; i < CONFIG.shapeCount; i++) {
            // 随机参数
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * Math.min(width, height) * 0.4;
            const size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
            const pulseSize = size * (1 + 0.2 * Math.sin(pulse + i));

            // 位置
            const x = Math.cos(angle + rotation) * distance;
            const y = Math.sin(angle + rotation) * distance;

            // 颜色（深海蓝 + 水晶紫）
            const colorType = Math.random() > 0.5 ? 'deepSea' : 'crystalPurple';
            const colorIndex = Math.floor(Math.random() * CONFIG.colors[colorType].length);
            const color = CONFIG.colors[colorType][colorIndex];

            // 反光效果（径向渐变）
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
            gradient.addColorStop(0, color.replace(')', ',0.8)').replace('rgb', 'rgba'));
            gradient.addColorStop(0.5, color.replace(')', ',0.4)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, color.replace(')', ',0.1)').replace('rgb', 'rgba'));

            // 绘制图形（不规则水晶矿形状）
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + rotation * 2);

            // 只用不规则水晶矿形状（不用圆圈或六边形）
            drawCrystalShape(ctx, 0, 0, pulseSize);

            ctx.restore();
        }
    }

    // ========== 绘制不规则水晶矿形状 ==========
    function drawCrystalShape(context, x, y, size) {
        // 生成不规则多边形（水晶矿形状）
        const vertices = [];
        const numPoints = 5 + Math.floor(Math.random() * 4);  // 5-8 个顶点

        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 / numPoints) * i + (Math.random() - 0.5) * 0.8;
            const radius = size * (0.6 + Math.random() * 0.6);  // 随机半径（制造锯齿）
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            vertices.push({ x: px, y: py });
        }

        // 绘制多边形
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }
        context.closePath();

        // 填充（深海蓝/水晶紫，半透明）
        context.fillStyle = `rgba(123, 45, 142, ${0.2 + 0.2 * Math.sin(pulse)})`;
        context.fill();

        // 边框（反光效果）
        context.strokeStyle = `rgba(155, 89, 182, ${0.5 + 0.3 * Math.sin(pulse * 2)})`;
        context.lineWidth = 1.5;
        context.stroke();

        // 内部细节（模拟水晶纹理）
        context.beginPath();
        for (let i = 0; i < vertices.length; i++) {
            const midX = (vertices[i].x + vertices[(i + 1) % vertices.length].x) / 2;
            const midY = (vertices[i].y + vertices[(i + 1) % vertices.length].y) / 2;
            context.moveTo(x, y);
            context.lineTo(midX, midY);
        }
        context.strokeStyle = `rgba(155, 89, 182, ${0.3 + 0.2 * Math.sin(pulse * 1.5)})`;
        context.lineWidth = 0.5;
        context.stroke();
    }

    // ========== 启动 ==========
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 导出（可选）
    window.Kaleidoscope = {
        stop: function() {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        },
        start: function() {
            if (!animationId) {
                animate();
            }
        }
    };
})();
