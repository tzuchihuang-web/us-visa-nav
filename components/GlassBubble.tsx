/**
 * GLASS BUBBLE COMPONENT
 * 
 * 透明玻璃質感泡泡，帶有折射、彩虹邊、光暈效果
 * 可漂浮在畫面中，與文字互動
 */

'use client';

import React, { useEffect, useRef } from 'react';

interface GlassBubbleProps {
  size?: number;
  x?: number;
  y?: number;
  animationDuration?: number;
  delay?: number;
  className?: string;
}

export function GlassBubble({
  size = 120,
  x = 50,
  y = 50,
  animationDuration = 20,
  delay = 0,
  className = '',
}: GlassBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bubbleRef.current) return;

    // 添加隨機漂浮動畫
    const bubble = bubbleRef.current;
    const keyframes = `
      @keyframes float-${delay} {
        0%, 100% {
          transform: translate(0, 0) rotate(0deg);
        }
        25% {
          transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 40 - 20}px) rotate(5deg);
        }
        50% {
          transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 50 - 25}px) rotate(-3deg);
        }
        75% {
          transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 40 - 20}px) rotate(4deg);
        }
      }
    `;

    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);

    bubble.style.animation = `float-${delay} ${animationDuration}s ease-in-out infinite`;
    bubble.style.animationDelay = `${delay}s`;

    return () => {
      document.head.removeChild(style);
    };
  }, [animationDuration, delay]);

  return (
    <div
      ref={bubbleRef}
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* 外層光暈 */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* 主要泡泡體 */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          boxShadow: `
            inset 0 0 20px rgba(255, 255, 255, 0.5),
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2)
          `,
        }}
      >
        {/* 高光區域 */}
        <div
          className="absolute rounded-full"
          style={{
            top: '15%',
            left: '20%',
            width: '40%',
            height: '40%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
          }}
        />

        {/* 彩虹折射效果 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              linear-gradient(45deg, 
                transparent 30%, 
                rgba(255, 100, 200, 0.15) 40%,
                rgba(100, 200, 255, 0.15) 50%,
                rgba(200, 255, 100, 0.15) 60%,
                transparent 70%
              )
            `,
            opacity: 0.6,
          }}
        />
      </div>

      {/* 下方陰影 */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: '-20%',
          left: '10%',
          width: '80%',
          height: '20%',
          background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.1), transparent)',
          filter: 'blur(10px)',
        }}
      />
    </div>
  );
}

/**
 * BUBBLE BACKGROUND COMPONENT
 * 
 * 背景漂浮泡泡效果
 */

interface BubbleBackgroundProps {
  count?: number;
  className?: string;
}

export function BubbleBackground({ count = 8, className = '' }: BubbleBackgroundProps) {
  const bubbles = Array.from({ length: count }, (_, i) => ({
    size: Math.random() * 100 + 60, // 60-160px
    x: Math.random() * 100, // 0-100%
    y: Math.random() * 100, // 0-100%
    duration: Math.random() * 10 + 15, // 15-25s
    delay: Math.random() * 5, // 0-5s
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {bubbles.map((bubble, index) => (
        <GlassBubble
          key={index}
          size={bubble.size}
          x={bubble.x}
          y={bubble.y}
          animationDuration={bubble.duration}
          delay={bubble.delay}
        />
      ))}
    </div>
  );
}
