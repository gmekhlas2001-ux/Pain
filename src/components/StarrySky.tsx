import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import { Star } from '../types/star';
import { SkySegment } from './SkySegment';
import { InteractiveStar } from './InteractiveStar';
import { Home } from 'lucide-react';

interface StarrySkyProps {
  stars: Star[];
  onStarClick: (star: Star) => void;
  isDayTime?: boolean;
}

export const StarrySky: React.FC<StarrySkyProps> = ({ stars, onStarClick, isDayTime = false }) => {
  const [hoveredStar, setHoveredStar] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });

  const skyOffset = useMotionValue(0);
  const smoothOffset = useSpring(skyOffset, { stiffness: 300, damping: 30 });

  const forceNightTime = true;

  const resetToHome = () => {
    animate(skyOffset, 0, {
      type: "spring",
      stiffness: 100,
      damping: 20
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      offset: skyOffset.get()
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const newOffset = dragStart.offset + deltaX;
      skyOffset.set(newOffset);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX,
      offset: skyOffset.get()
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - dragStart.x;
      const newOffset = dragStart.offset + deltaX;
      skyOffset.set(newOffset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - dragStart.x;
        const newOffset = dragStart.offset + deltaX;
        skyOffset.set(newOffset);
      }
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const newOffset = dragStart.offset + deltaX;
        skyOffset.set(newOffset);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'pan-x',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 75% 15%, rgba(255, 255, 255, 0.15) 0%, transparent 25%),
            radial-gradient(ellipse at 50% 100%, rgba(50, 80, 120, 0.3) 0%, transparent 50%),
            linear-gradient(180deg,
              #0a1628 0%,
              #1a2840 20%,
              #2d4a6b 40%,
              #3d5a7a 60%,
              #4a6888 80%,
              #5a7895 100%
            )
          `,
          willChange: 'transform'
        }}
      />

      <SkySegment
        segment={0}
        skyOffset={skyOffset}
      />

      {stars.map((star) => (
        <InteractiveStar
          key={star.id}
          star={star}
          skyOffset={skyOffset}
          onStarClick={onStarClick}
          isDragging={isDragging}
          hoveredStar={hoveredStar}
          setHoveredStar={setHoveredStar}
        />
      ))}

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '35%' }}>
        <svg
          viewBox="0 0 1200 400"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3a5a40', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#4a6b50', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#5a7c60', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#8fbc8f', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#6a9a6a', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          <path
            d="M 0,300 Q 300,200 600,250 T 1200,280 L 1200,400 L 0,400 Z"
            fill="url(#hillGradient)"
            opacity="0.6"
          />

          <ellipse
            cx="600"
            cy="320"
            rx="250"
            ry="30"
            fill="url(#grassGradient)"
            opacity="0.9"
          />

          <g className="flowers">
            {Array.from({ length: 15 }).map((_, i) => {
              const x = 350 + (i * 35) + (Math.sin(i) * 20);
              const y = 310 + (Math.cos(i * 2) * 10);
              const colors = ['#ff69b4', '#ffd700', '#ff8c00', '#87ceeb', '#dda0dd'];
              const color = colors[i % colors.length];
              return (
                <g key={`flower-${i}`}>
                  <line x1={x} y1={y} x2={x} y2={y + 15} stroke="#4a6b50" strokeWidth="1.5" />
                  <circle cx={x} cy={y} r="3" fill={color} opacity="0.8" />
                </g>
              );
            })}
          </g>
        </svg>

        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <svg width="80" height="100" viewBox="0 0 80 100" className="drop-shadow-2xl">
            <defs>
              <linearGradient id="characterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#5dade2', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#2e86ab', stopOpacity: 1 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <ellipse cx="40" cy="95" rx="25" ry="3" fill="rgba(0,0,0,0.3)" />

            <ellipse cx="40" cy="70" rx="18" ry="22" fill="url(#characterGradient)" filter="url(#glow)" />

            <circle cx="40" cy="45" r="15" fill="url(#characterGradient)" filter="url(#glow)" />

            <path
              d="M 25,35 Q 20,25 25,20 L 30,25 Z"
              fill="url(#characterGradient)"
              filter="url(#glow)"
            />
            <path
              d="M 55,35 Q 60,25 55,20 L 50,25 Z"
              fill="url(#characterGradient)"
              filter="url(#glow)"
            />

            <ellipse cx="35" cy="47" rx="2" ry="3" fill="#1a1a2e" opacity="0.6" />
            <ellipse cx="45" cy="47" rx="2" ry="3" fill="#1a1a2e" opacity="0.6" />

            <path
              d="M 32,53 Q 40,56 48,53"
              stroke="#1a1a2e"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />

            <ellipse cx="20" cy="75" rx="6" ry="8" fill="url(#characterGradient)" opacity="0.9" />
            <ellipse cx="60" cy="75" rx="6" ry="8" fill="url(#characterGradient)" opacity="0.9" />

            <rect x="33" y="85" width="6" height="12" rx="3" fill="#2e86ab" opacity="0.8" />
            <rect x="41" y="85" width="6" height="12" rx="3" fill="#2e86ab" opacity="0.8" />
          </svg>
        </div>
      </div>

      <button
        onClick={resetToHome}
        className="fixed bottom-24 right-6 z-50 bg-gray-900/90 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg border border-gray-700 transition-all hover:scale-110"
        title="Return to home position"
      >
        <Home size={24} />
      </button>
    </div>
  );
};
