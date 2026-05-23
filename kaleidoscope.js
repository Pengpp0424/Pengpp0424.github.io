/* 
 * kaleidoscope.js - Hero 区非欧几何动画
 * 风格：非欧几里得几何视角，深海蓝+亮紫，水晶矿石光影闪烁
 * 稀疏几何体，不密集，无密集恐惧症风险
 */

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        // 颜色
        deepSeaBlue: '#0a1a3a',      // 深海蓝（主色）
        brightPurple: '#9b30ff',      // 亮紫（强调色）
        crystalGlow: '#c77dff',       // 水晶光晕
        darkBlue: '#0f2847',          // 暗蓝
        accentBlue: '#1e6091',        // 强调蓝
        
        // 几何体
        maxShapes: 5,                 // 最多5个几何体（稀疏！）
        minShapes: 3,                 // 最少3个几何体
        
        // 动画
        rotationSpeed: 0.0008,        // 缓慢旋转
        floatSpeed: 0.0005,           // 漂浮速度
        flickerSpeed: 0.02,           // 闪烁速度
        moveSpeed: 0.3,               // 移动速度
        
        // 尺寸
        minSize: 40,                  // 最小尺寸
        maxSize: 120                  // 最大尺寸
    };

    // ========== 状态 ==========
    let canvas, ctx, width, height;
    let time = 0;
    let shapes = [];
    let animationId = null;

    // ========== 几何体类 ==========
    class NonEuclidShape {
        constructor() {
            this.reset();
        }
        
        reset() {
            // 随机位置（整个Hero区）
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            
            // 随机尺寸
            this.size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
            
            // 随机旋转
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * CONFIG.rotationSpeed * 2;
            
            // 漂浮方向
            this.floatAngle = Math.random() * Math.PI * 2;
            this.floatRadius = 0;
            this.floatSpeed = CONFIG.floatSpeed * (0.5 + Math.random());
            
            // 几何类型（0=扭曲多面体, 1=非欧三角, 2=空间扭曲环, 3=棱柱碎片, 4=超立方投影）
            this.type = Math.floor(Math.random() * 5);
            
            // 顶点数
            this.vertices = 4 + Math.floor(Math.random() * 5);  // 4-8个顶点
            
            // 颜色（深海蓝或亮紫）
            this.isBlue = Math.random() > 0.4;  // 60%蓝色，40%紫色
            
            // 水晶闪烁参数
            this.flickerPhase = Math.random() * Math.PI * 2;
            this.flickerSpeed = CONFIG.flickerSpeed * (0.5 + Math.random());
            
            // 透明度
            this.baseAlpha = 0.15 + Math.random() * 0.25;  // 0.15-0.40（半透明）
            
            // 非欧扭曲参数
            this.warpFactor = 0.1 + Math.random() * 0.3;  // 扭曲程度
            
            // 生命周期
            this.life = 1.0;
            this.fadeSpeed = 0.0003 + Math.random() * 0.0005;
        }
        
        update() {
            // 旋转
            this.rotation += this.rotationSpeed;
            
            // 漂浮
            this.floatRadius += this.floatSpeed;
            const fx = this.x + Math.cos(this.floatAngle + this.floatRadius) * 20;
            const fy = this.y + Math.sin(this.floatAngle + this.floatRadius) * 15;
            
            // 水晶闪烁
            this.flickerPhase += this.flickerSpeed;
            
            // 生命周期
            this.life -= this.fadeSpeed;
            if (this.life <= 0) {
                this.reset();
            }
            
            return { x: fx, y: fy };
        }
        
        draw(context, pos) {
            const alpha = this.baseAlpha * this.life;
            const flicker = 0.5 + 0.5 * Math.sin(this.flickerPhase);  // 0-1闪烁
            
            context.save();
            context.translate(pos.x, pos.y);
            context.rotate(this.rotation);
            
            // 非欧扭曲：让顶点位置随时间变化（空间弯曲效果）
            const warp = this.warpFactor * Math.sin(time * 0.001 + this.flickerPhase);
            
            // 绘制几何体
            switch(this.type) {
                case 0: this.drawWarpedPolyhedron(context, alpha, flicker, warp); break;
                case 1: this.drawNonEuclidTriangle(context, alpha, flicker, warp); break;
                case 2: this.drawSpaceWarpRing(context, alpha, flicker, warp); break;
                case 3: this.drawPrismShard(context, alpha, flicker, warp); break;
                case 4: this.drawHypercubeProjection(context, alpha, flicker, warp); break;
            }
            
            context.restore();
        }
        
        // 颜色辅助
        getColor(alpha, bright) {
            if (this.isBlue) {
                const r = bright ? 30 : 15;
                const g = bright ? 96 : 40;
                const b = bright ? 145 : 71;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            } else {
                const r = bright ? 199 : 155;
                const g = bright ? 125 : 48;
                const b = bright ? 255 : 255;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        }
        
        // 类型0：扭曲多面体
        drawWarpedPolyhedron(context, alpha, flicker, warp) {
            const pts = [];
            for (let i = 0; i < this.vertices; i++) {
                const angle = (Math.PI * 2 / this.vertices) * i;
                const dist = this.size * (0.4 + 0.3 * Math.sin(angle * 3 + warp * 5));
                pts.push({
                    x: dist * Math.cos(angle),
                    y: dist * Math.sin(angle)
                });
            }
            
            // 外轮廓
            context.beginPath();
            context.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                // 非欧曲线（贝塞尔曲线，不是直线）
                const prev = pts[i - 1];
                const curr = pts[i];
                const cx = (prev.x + curr.x) / 2 + warp * 30 * Math.sin(i + time * 0.002);
                const cy = (prev.y + curr.y) / 2 + warp * 30 * Math.cos(i + time * 0.002);
                context.quadraticCurveTo(cx, cy, curr.x, curr.y);
            }
            context.closePath();
            
            // 填充（水晶渐变）
            const grad = context.createRadialGradient(0, 0, 0, 0, 0, this.size);
            grad.addColorStop(0, this.getColor(alpha * (0.6 + flicker * 0.4), true));
            grad.addColorStop(0.7, this.getColor(alpha * 0.3, false));
            grad.addColorStop(1, this.getColor(0, false));
            context.fillStyle = grad;
            context.fill();
            
            // 水晶反光边线
            context.strokeStyle = this.getColor(alpha * flicker * 0.8, true);
            context.lineWidth = 1;
            context.stroke();
            
            // 内部棱线（水晶纹理）
            context.beginPath();
            for (let i = 0; i < pts.length; i++) {
                context.moveTo(0, 0);
                const midX = (pts[i].x + pts[(i+1) % pts.length].x) / 2;
                const midY = (pts[i].y + pts[(i+1) % pts.length].y) / 2;
                context.lineTo(midX, midY);
            }
            context.strokeStyle = this.getColor(alpha * flicker * 0.5, true);
            context.lineWidth = 0.5;
            context.stroke();
        }
        
        // 类型1：非欧三角（角度和不等于180°的三角形）
        drawNonEuclidTriangle(context, alpha, flicker, warp) {
            const pts = [];
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i + Math.PI / 6;
                const dist = this.size * (0.5 + warp * Math.sin(angle * 2 + time * 0.003));
                pts.push({
                    x: dist * Math.cos(angle),
                    y: dist * Math.sin(angle)
                });
            }
            
            // 外轮廓（弯曲边）
            context.beginPath();
            context.moveTo(pts[0].x, pts[0].y);
            for (let i = 0; i < 3; i++) {
                const curr = pts[i];
                const next = pts[(i + 1) % 3];
                const cx = (curr.x + next.x) / 2 + warp * 40;
                const cy = (curr.y + next.y) / 2 - warp * 40;
                context.quadraticCurveTo(cx, cy, next.x, next.y);
            }
            context.closePath();
            
            // 填充
            const grad = context.createRadialGradient(0, 0, 0, 0, 0, this.size);
            grad.addColorStop(0, this.getColor(alpha * (0.5 + flicker * 0.3), true));
            grad.addColorStop(1, this.getColor(0, false));
            context.fillStyle = grad;
            context.fill();
            
            // 反光边
            context.strokeStyle = this.getColor(alpha * flicker * 0.7, true);
            context.lineWidth = 1.2;
            context.stroke();
            
            // 中心点高光（水晶闪烁）
            if (flicker > 0.7) {
                const hlGrad = context.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.3);
                hlGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * flicker * 0.3})`);
                hlGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                context.fillStyle = hlGrad;
                context.fill();
            }
        }
        
        // 类型2：空间扭曲环
        drawSpaceWarpRing(context, alpha, flicker, warp) {
            const segments = 24;
            
            context.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (Math.PI * 2 / segments) * i;
                // 非欧扭曲：半径随角度和时间变化
                const r = this.size * 0.5 * (1 + warp * Math.sin(angle * 3 + time * 0.002));
                const x = r * Math.cos(angle);
                const y = r * Math.sin(angle);
                if (i === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.closePath();
            
            // 填充（空心环效果）
            context.strokeStyle = this.getColor(alpha * (0.4 + flicker * 0.4), true);
            context.lineWidth = 2 + flicker * 2;
            context.stroke();
            
            // 内环
            context.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (Math.PI * 2 / segments) * i;
                const r = this.size * 0.3 * (1 + warp * Math.sin(angle * 2 - time * 0.003));
                const x = r * Math.cos(angle);
                const y = r * Math.sin(angle);
                if (i === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.closePath();
            context.strokeStyle = this.getColor(alpha * flicker * 0.6, false);
            context.lineWidth = 1;
            context.stroke();
            
            // 环心高光
            const hlGrad = context.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.2);
            hlGrad.addColorStop(0, this.getColor(alpha * flicker * 0.4, true));
            hlGrad.addColorStop(1, this.getColor(0, false));
            context.fillStyle = hlGrad;
            context.beginPath();
            context.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
            context.fill();
        }
        
        // 类型3：棱柱碎片
        drawPrismShard(context, alpha, flicker, warp) {
            // 不规则四边形（晶体碎片形状）
            const pts = [
                { x: -this.size * 0.5, y: -this.size * 0.3 + warp * 20 },
                { x: this.size * 0.3, y: -this.size * 0.5 },
                { x: this.size * 0.5 + warp * 15, y: this.size * 0.2 },
                { x: -this.size * 0.2, y: this.size * 0.4 + warp * 10 }
            ];
            
            context.beginPath();
            context.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                context.lineTo(pts[i].x, pts[i].y);
            }
            context.closePath();
            
            // 水晶渐变填充
            const grad = context.createLinearGradient(-this.size * 0.5, -this.size * 0.5, this.size * 0.5, this.size * 0.5);
            grad.addColorStop(0, this.getColor(alpha * 0.3, true));
            grad.addColorStop(0.5, this.getColor(alpha * (0.4 + flicker * 0.3), false));
            grad.addColorStop(1, this.getColor(alpha * 0.2, true));
            context.fillStyle = grad;
            context.fill();
            
            // 反光边
            context.strokeStyle = this.getColor(alpha * (0.3 + flicker * 0.5), true);
            context.lineWidth = 1;
            context.stroke();
            
            // 棱线（水晶内部纹理）
            context.beginPath();
            context.moveTo(pts[0].x, pts[0].y);
            context.lineTo(pts[2].x, pts[2].y);
            context.moveTo(pts[1].x, pts[1].y);
            context.lineTo(pts[3].x, pts[3].y);
            context.strokeStyle = this.getColor(alpha * flicker * 0.4, true);
            context.lineWidth = 0.5;
            context.stroke();
            
            // 表面反光点
            if (flicker > 0.6) {
                const hx = -this.size * 0.15;
                const hy = -this.size * 0.1;
                const hlGrad = context.createRadialGradient(hx, hy, 0, hx, hy, this.size * 0.15);
                hlGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * flicker * 0.25})`);
                hlGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                context.fillStyle = hlGrad;
                context.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
            }
        }
        
        // 类型4：超立方体投影（4D→2D投影）
        drawHypercubeProjection(context, alpha, flicker, warp) {
            // 简化的4D超立方体投影到2D
            const size = this.size * 0.4;
            const depth = warp * 0.5 + 0.5;  // 4D旋转深度
            
            // 内层立方体
            const inner = [
                { x: -size * 0.5, y: -size * 0.5 },
                { x: size * 0.5, y: -size * 0.5 },
                { x: size * 0.5, y: size * 0.5 },
                { x: -size * 0.5, y: size * 0.5 }
            ];
            
            // 外层立方体（4D投影偏移）
            const outer = inner.map(p => ({
                x: p.x * (1.3 + depth * 0.3),
                y: p.y * (1.3 + depth * 0.3)
            }));
            
            // 绘制外层
            context.beginPath();
            context.moveTo(outer[0].x, outer[0].y);
            for (let i = 1; i < outer.length; i++) context.lineTo(outer[i].x, outer[i].y);
            context.closePath();
            context.strokeStyle = this.getColor(alpha * (0.2 + flicker * 0.3), true);
            context.lineWidth = 1;
            context.stroke();
            
            // 绘制内层
            context.beginPath();
            context.moveTo(inner[0].x, inner[0].y);
            for (let i = 1; i < inner.length; i++) context.lineTo(inner[i].x, inner[i].y);
            context.closePath();
            context.strokeStyle = this.getColor(alpha * (0.3 + flicker * 0.4), true);
            context.lineWidth = 1.2;
            context.stroke();
            
            // 连接线（4D投影的特征）
            context.beginPath();
            for (let i = 0; i < 4; i++) {
                context.moveTo(inner[i].x, inner[i].y);
                context.lineTo(outer[i].x, outer[i].y);
            }
            context.strokeStyle = this.getColor(alpha * flicker * 0.4, false);
            context.lineWidth = 0.5;
            context.stroke();
            
            // 中心高光
            const hlGrad = context.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
            hlGrad.addColorStop(0, this.getColor(alpha * flicker * 0.3, true));
            hlGrad.addColorStop(1, this.getColor(0, false));
            context.fillStyle = hlGrad;
            context.beginPath();
            context.arc(0, 0, size * 0.3, 0, Math.PI * 2);
            context.fill();
        }
    }

    // ========== 初始化 ==========
    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'kaleidoscope-canvas';
        canvas.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0.35;
        `;

        const heroSection = document.getElementById('hero');
        const heroBg = heroSection.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.insertAdjacentElement('afterend', canvas);
        } else {
            heroSection.insertBefore(canvas, heroSection.firstChild);
        }

        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        // 创建几何体（稀疏！）
        createShapes();
        
        // 开始动画
        animate();
    }

    function resize() {
        const heroSection = document.getElementById('hero');
        width = heroSection.offsetWidth;
        height = heroSection.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function createShapes() {
        shapes = [];
        const count = CONFIG.minShapes + Math.floor(Math.random() * (CONFIG.maxShapes - CONFIG.minShapes + 1));
        for (let i = 0; i < count; i++) {
            shapes.push(new NonEuclidShape());
        }
    }

    // ========== 动画循环 ==========
    function animate() {
        // 清空画布（深色半透明覆盖，制造拖尾）
        ctx.fillStyle = 'rgba(5, 10, 25, 0.15)';
        ctx.fillRect(0, 0, width, height);

        time++;

        // 绘制每个几何体
        shapes.forEach(shape => {
            const pos = shape.update();
            shape.draw(ctx, pos);
        });

        animationId = requestAnimationFrame(animate);
    }

    // ========== 启动 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.Kaleidoscope = {
        stop: () => { if (animationId) cancelAnimationFrame(animationId); },
        start: () => { animate(); }
    };
})();
