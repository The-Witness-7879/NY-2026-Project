
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  friction: number;
}

// 节日礼花的多彩颜色（用于手动触发的喷发效果）
const CONFETTI_COLORS = ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#f472b6', '#a78bfa'];
// 背景烟火的暖色调颜色（用于自动燃放的背景烟火）
const WARM_COLORS = [
  '#fbbf24', // 琥珀金
  '#f59e0b', // 橙黄
  '#ef4444', // 鲜红
  '#f87171', // 珊瑚红
  '#fcd34d', // 亮金
  '#fb7185'  // 玫瑰粉
];

export interface CelebrationHandle {
  burst: () => void;
}

export const CelebrationEffects = forwardRef<CelebrationHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    burst: () => createConfettiBurst()
  }));

  const createParticle = (x: number, y: number, color: string, isConfetti = false) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = isConfetti ? Math.random() * 10 + 5 : Math.random() * 6 + 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isConfetti ? 5 : 0),
      alpha: 1,
      color,
      size: isConfetti ? Math.random() * 6 + 2 : Math.random() * 2 + 1,
      decay: Math.random() * 0.015 + 0.005,
      gravity: isConfetti ? 0.2 : 0.05,
      friction: 0.96
    };
  };

  const createFirework = () => {
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight;
    const targetY = Math.random() * (window.innerHeight * 0.4) + 100;
    // 使用专门的暖色调
    const color = WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)];
    
    for (let i = 0; i < 50; i++) {
      particles.current.push(createParticle(x, targetY, color));
    }
  };

  const createConfettiBurst = () => {
    const sides = [
      { x: 0, y: window.innerHeight },
      { x: window.innerWidth, y: window.innerHeight }
    ];
    
    sides.forEach(side => {
      for (let i = 0; i < 40; i++) {
        // 手动喷发使用全彩色系，增加层次
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const p = createParticle(side.x, side.y, color, true);
        p.vx = (side.x === 0 ? 1 : -1) * (Math.random() * 15 + 5);
        p.vy = -Math.random() * 20 - 10;
        particles.current.push(p);
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 随机触发背景烟火
      if (Math.random() < 0.01) {
        createFirework();
      }

      particles.current = particles.current.filter(p => p.alpha > 0);

      particles.current.forEach(p => {
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        
        // 绘制发光效果
        if (p.size < 4) {
          ctx.shadowBlur = 12; // 略微增加暖色调的发光度
          ctx.shadowColor = p.color;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[80]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
});
