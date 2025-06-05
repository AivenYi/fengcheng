/**
 * particles.js
 * 为丰城网站添加炫酷的粒子效果
 */

class ParticleSystem {
    constructor(options = {}) {
        this.canvas = options.canvas || document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = options.width || window.innerWidth;
        this.height = options.height || window.innerHeight;
        this.particleCount = options.particleCount || 100;
        this.particles = [];
        this.mousePosition = { x: null, y: null };
        this.interactRadius = options.interactRadius || 150;
        this.colors = options.colors || ['#4a6fa5', '#166d67', '#6a8d92', '#f0f7f7'];
        this.maxSpeed = options.maxSpeed || 1;
        this.connectDistance = options.connectDistance || 150;
        this.connectOpacity = options.connectOpacity || 0.5;
        this.mouseInteraction = options.mouseInteraction !== false;
        this.backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0)';
        
        // 设置画布尺寸
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // 设置画布样式
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.8';
        
        // 初始化粒子
        this.init();
        
        // 添加事件监听
        if (this.mouseInteraction) {
            window.addEventListener('mousemove', this.handleMouseMove.bind(this));
            window.addEventListener('mouseout', this.handleMouseOut.bind(this));
        }
        
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    init() {
        // 创建粒子
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        // 开始动画
        this.animate();
    }
    
    createParticle() {
        const size = Math.random() * 4 + 0.5;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        // 提取颜色的RGB值并添加透明度
        let opacity = Math.random() * 0.5 + 0.3; // 0.3到0.8之间的透明度
        let rgbaColor;
        
        if (color.startsWith('#')) {
            // 将十六进制颜色转换为RGBA
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        } else {
            // 已经是rgba格式
            rgbaColor = color;
        }
        
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: size,
            color: rgbaColor,
            speedX: (Math.random() - 0.5) * this.maxSpeed,
            speedY: (Math.random() - 0.5) * this.maxSpeed,
            originalSize: size,
            opacity: opacity,
            // 添加一些随机波动
            wobble: Math.random() * 2 - 1,
            wobbleSpeed: Math.random() * 0.02 + 0.01
        };
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制背景
        if (this.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // 更新和绘制粒子
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // 更新波动
            if (p.wobble !== undefined) {
                p.wobble += p.wobbleSpeed;
                // 添加微小的波动到速度
                p.x += Math.sin(p.wobble) * 0.1;
                p.y += Math.cos(p.wobble) * 0.1;
            }
            
            // 更新位置
            p.x += p.speedX;
            p.y += p.speedY;
            
            // 边界检查
            if (p.x < 0) {
                p.x = 0;
                p.speedX *= -1;
            } else if (p.x > this.width) {
                p.x = this.width;
                p.speedX *= -1;
            }
            
            if (p.y < 0) {
                p.y = 0;
                p.speedY *= -1;
            } else if (p.y > this.height) {
                p.y = this.height;
                p.speedY *= -1;
            }
            
            // 鼠标交互
            if (this.mousePosition.x !== null && this.mousePosition.y !== null) {
                const dx = p.x - this.mousePosition.x;
                const dy = p.y - this.mousePosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.interactRadius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (this.interactRadius - distance) / this.interactRadius;
                    
                    p.x += Math.cos(angle) * force * 2;
                    p.y += Math.sin(angle) * force * 2;
                    p.size = p.originalSize * (1 + force);
                    
                    // 增加波动速度
                    if (p.wobbleSpeed) {
                        p.wobbleSpeed = Math.min(p.wobbleSpeed * 1.05, 0.1);
                    }
                } else {
                    p.size = p.originalSize;
                    // 恢复正常波动速度
                    if (p.wobbleSpeed) {
                        p.wobbleSpeed = Math.max(p.wobbleSpeed * 0.98, 0.01);
                    }
                }
            } else {
                p.size = p.originalSize;
            }
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            // 添加发光效果
            if (p.size > 2) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
                
                // 创建径向渐变
                const gradient = this.ctx.createRadialGradient(
                    p.x, p.y, p.size * 0.5,
                    p.x, p.y, p.size * 1.5
                );
                
                // 提取颜色的RGB部分
                let r, g, b;
                if (p.color.startsWith('rgba')) {
                    const parts = p.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                    if (parts) {
                        r = parts[1];
                        g = parts[2];
                        b = parts[3];
                    }
                }
                
                if (r && g && b) {
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.5})`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
            }
            
            // 连接粒子
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectDistance) {
                    // 计算线条透明度
                    const opacity = (1 - distance / this.connectDistance) * this.connectOpacity;
                    
                    // 提取两个粒子的颜色
                    let color1 = p.color;
                    let color2 = p2.color;
                    
                    // 创建渐变线条
                    const gradient = this.ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(1, color2);
                    
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = Math.min(p.size, p2.size) * 0.3;
                    this.ctx.globalAlpha = opacity;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1.0;
                }
            }
        }
        
        requestAnimationFrame(this.animate.bind(this));
    }
    
    handleMouseMove(e) {
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
    }
    
    handleMouseOut() {
        this.mousePosition.x = null;
        this.mousePosition.y = null;
    }
    
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    // 添加到DOM
    appendTo(element) {
        const container = typeof element === 'string' ? document.querySelector(element) : element;
        if (container) {
            container.appendChild(this.canvas);
        } else {
            document.body.appendChild(this.canvas);
        }
    }
}

// 页面加载完成后初始化粒子系统
document.addEventListener('DOMContentLoaded', () => {
    // 主背景粒子系统
    const particleSystem = new ParticleSystem({
        particleCount: 100,
        colors: ['#4a6fa5', '#166d67', '#6a8d92', '#f0f7f7'],
        maxSpeed: 0.3,
        connectDistance: 150,
        interactRadius: 200,
        connectOpacity: 0.3
    });
    
    // 添加到body
    particleSystem.appendTo('body');
    
    // 为header添加特殊粒子效果
    const headerParticles = new ParticleSystem({
        particleCount: 50,
        colors: ['#ffffff', '#f0f7f7', '#e0e0e0', '#4a6fa5'],
        maxSpeed: 0.2,
        connectDistance: 120,
        interactRadius: 180,
        connectOpacity: 0.4,
        backgroundColor: 'rgba(22, 109, 103, 0.05)'
    });
    
    // 创建一个容器并添加到header
    const headerContainer = document.createElement('div');
    headerContainer.style.position = 'absolute';
    headerContainer.style.top = '0';
    headerContainer.style.left = '0';
    headerContainer.style.width = '100%';
    headerContainer.style.height = '100%';
    headerContainer.style.overflow = 'hidden';
    headerContainer.style.zIndex = '0';
    
    const header = document.querySelector('header');
    if (header) {
        header.style.position = 'relative';
        header.appendChild(headerContainer);
        headerParticles.appendTo(headerContainer);
    }
    
    // 为特色亮点部分添加粒子效果
    const featuresParticles = new ParticleSystem({
        particleCount: 60,
        colors: ['#166d67', '#4a6fa5', '#f0f7f7'],
        maxSpeed: 0.25,
        connectDistance: 130,
        interactRadius: 160,
        connectOpacity: 0.35
    });
    
    // 创建一个容器并添加到特色亮点部分
    const featuresContainer = document.createElement('div');
    featuresContainer.style.position = 'absolute';
    featuresContainer.style.top = '0';
    featuresContainer.style.left = '0';
    featuresContainer.style.width = '100%';
    featuresContainer.style.height = '100%';
    featuresContainer.style.overflow = 'hidden';
    featuresContainer.style.zIndex = '0';
    
    const features = document.querySelector('#features');
    if (features) {
        features.style.position = 'relative';
        features.appendChild(featuresContainer);
        featuresParticles.appendTo(featuresContainer);
    }
});