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
            deepSea: ['#0f3460', '#16213e', '#1a1a2e', '#0a2647'],  // 深海蓝（降低亮度）
            crystalPurple: ['#4a1a5e', '#5b2d8e', '#6b3dae', '#3c1260'],  // 水晶紫（降低亮度）
            glow: ['rgba(15,52,96,0.3)', 'rgba(123,45,142,0.3)', 'rgba(155,89,182,0.2)']  // 反光（降低透明度）
        },
        shapeCount: 8,                // 减少图形数量（避免过亮）
        rotationSpeed: 0.001,         // 降低旋转速度
        pulseSpeed: 0.005,            // 降低脉动速度
        maxSize: 60,                  // 减小最大尺寸
        minSize: 15                   // 增加最小尺寸
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
        // 修改：降低整体透明度
        canvas.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0.3;  /* 从 0.5 降到 0.3 */
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';  /* 从 0.08 增加到 0.12，拖尾更短 */
        ctx.fillRect(0, 0, width, height);

        // 更新状态（降低速度）
        rotation += CONFIG.rotationSpeed;  /* 从 0.002 降到 0.001 */
        pulse += CONFIG.pulseSpeed;        /* 从 0.01 降到 0.005 */

        // 在整个区域绘制多个万花筒簇（覆盖整个长方形）
        const positions = [
            { x: width * 0.15, y: height * 0.2 },
            { x: width * 0.5, y: height * 0.15 },
            { x: width * 0.85, y: height * 0.25 },
            { x: width * 0.3, y: height * 0.5 },
            { x: width * 0.7, y: height * 0.55 },
            { x: width * 0.2, y: height * 0.75 },
            { x: width * 0.8, y: height * 0.7 },
        ];

        positions.forEach(pos => {
            ctx.save();
            ctx.translate(pos.x, pos.y);
            drawKaleidoscope();
            ctx.restore();
        });

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

    // ========== 绘制几何图形（水晶质感） ==========
    function drawGeometricShapes() {
        for (let i = 0; i < CONFIG.shapeCount; i++) {
            // 随机参数
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * Math.min(width, height) * 0.35;  /* 从 0.4 降到 0.35 */
            const size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
            const pulseSize = size * (1 + 0.15 * Math.sin(pulse + i));  /* 从 0.2 降到 0.15 */

            // 位置
            const x = Math.cos(angle + rotation) * distance;
            const y = Math.sin(angle + rotation) * distance;

            // 颜色（深海蓝 + 水晶紫）
            const colorType = Math.random() > 0.5 ? 'deepSea' : 'crystalPurple';
            const colorIndex = Math.floor(Math.random() * CONFIG.colors[colorType].length);
            const color = CONFIG.colors[colorType][colorIndex];

            // 绘制图形（水晶矿质感）
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + rotation * 2);

            // 绘制水晶矿形状（不规则 + 交错纹理）
            drawCrystalFacet(ctx, 0, 0, pulseSize);

            ctx.restore();
        }
    }

    // ========== 绘制水晶矿形状（不规则 + 交错纹理 + 水晶反光） ==========
    function drawCrystalFacet(context, x, y, size) {
        // 生成不规则多边形（水晶矿形状，锯齿状）
        const vertices = [];
        const innerVertices = [];  // 内部交错顶点
        const numPoints = 6 + Math.floor(Math.random() * 4);  // 6-9 个顶点（更多锯齿）

        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 / numPoints) * i + (Math.random() - 0.5) * 0.6;  // 增加随机性
            const radius = size * (0.5 + Math.random() * 0.7);  // 随机半径（制造锯齿）
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            vertices.push({ x: px, y: py });

            // 内部交错顶点（制造水晶纹理）
            const innerAngle = angle + (Math.PI * 2 / numPoints) * 0.5;  // 偏移一半角度
            const innerRadius = radius * (0.3 + Math.random() * 0.4);  // 内部半径更小
            const innerPx = x + innerRadius * Math.cos(innerAngle);
            const innerPy = y + innerRadius * Math.sin(innerAngle);
            innerVertices.push({ x: innerPx, y: innerPy });
        }

        // 绘制外轮廓（水晶矿形状）
        context.beginPath();
        context.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
        }
        context.closePath();

        // 填充（深海蓝/水晶紫，低透明度 + 水晶质感渐变）
        const gradient = context.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `rgba(155, 89, 182, ${0.25 + 0.15 * Math.sin(pulse)})`);  /* 中心：较亮 */
        gradient.addColorStop(0.5, `rgba(123, 45, 142, ${0.15 + 0.1 * Math.sin(pulse)})`);  /* 中间：中等 */
        gradient.addColorStop(1, `rgba(74, 26, 94, ${0.05 + 0.05 * Math.sin(pulse)})`);  /* 边缘：很暗 */
        context.fillStyle = gradient;
        context.fill();

        // 边框（反光效果，亮紫）
        context.strokeStyle = `rgba(155, 89, 182, ${0.4 + 0.3 * Math.sin(pulse * 2)})`;  /* 降低透明度 */
        context.lineWidth = 1;
        context.stroke();

        // 内部交错纹理（模拟水晶矿的锯齿状纹理）
        context.beginPath();
        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            const innerCurrent = innerVertices[i];
            const innerNext = innerVertices[(i + 1) % innerVertices.length];

            // 绘制外部顶点到内部顶点的连线（交错纹理）
            context.moveTo(current.x, current.y);
            context.lineTo(innerCurrent.x, innerCurrent.y);

            // 绘制内部顶点到下一个外部顶点的连线（交错效果）
            context.moveTo(innerCurrent.x, innerCurrent.y);
            context.lineTo(next.x, next.y);
        }
        context.strokeStyle = `rgba(155, 89, 182, ${0.2 + 0.15 * Math.sin(pulse * 1.5)})`;  /* 降低透明度 */
        context.lineWidth = 0.5;
        context.stroke();

        // 高光点（模拟水晶反光）
        const highlightGradient = context.createRadialGradient(
            x + size * 0.2 * Math.cos(pulse),  /* 高光点偏移 */
            y + size * 0.2 * Math.sin(pulse),
            0,
            x, y,
            size * 0.5
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');  /* 中心：白色高光，低透明度 */
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');  /* 边缘：透明 */
        
        context.beginPath();
        context.arc(x, y, size * 0.5, 0, Math.PI * 2);
        context.fillStyle = highlightGradient;
        context.fill();
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
