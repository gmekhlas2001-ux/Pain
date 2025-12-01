import React, { useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Star } from '../types/star';

interface InteractiveStarProps {
  star: Star;
  skyOffset: MotionValue<number>;
  onStarClick: (star: Star) => void;
  isDragging: boolean;
  hoveredStar: string | null;
  setHoveredStar: (id: string | null) => void;
}

export const InteractiveStar: React.FC<InteractiveStarProps> = ({
  star,
  skyOffset,
  onStarClick,
  isDragging,
  hoveredStar,
  setHoveredStar,
}) => {
  const starTransform = useTransform(
    skyOffset,
    (value) => value + (star.x * window.innerWidth / 100)
  );

  return (
    <motion.div
      className="absolute cursor-pointer interactive-star"
      style={{
        left: 0,
        top: `${star.y}%`,
        x: starTransform,
        y: "-50%",
        willChange: 'transform',
        zIndex: hoveredStar === star.id ? 10 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) {
          onStarClick(star);
        }
      }}
      onMouseEnter={() => setHoveredStar(star.id)}
      onMouseLeave={() => setHoveredStar(null)}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onTouchMove={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="relative">
        {/* Outer glow effect */}
        <div
          className="absolute transition-all duration-300"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) ${hoveredStar === star.id ? 'scale(1.5)' : 'scale(1)'}`,
            filter: `blur(${Math.max(star.size * 2, 4)}px)`,
            opacity: star.brightness * 0.8,
          }}
        >
          <svg
            width={Math.max(star.size * 12, 24)}
            height={Math.max(star.size * 12, 24)}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
              fill={`rgba(255, 215, 0, ${star.brightness})`}
            />
          </svg>
        </div>

        {/* Main star body */}
        <div
          className="absolute transition-all duration-300"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) ${hoveredStar === star.id ? 'scale(1.3)' : 'scale(1)'}`,
            filter: `drop-shadow(0 0 ${Math.max(star.size * 3, 6)}px rgba(255, 215, 0, ${star.brightness * 0.9}))`,
          }}
        >
          <svg
            width={Math.max(star.size * 8, 16)}
            height={Math.max(star.size * 8, 16)}
            viewBox="0 0 24 24"
            fill="none"
          >
            <defs>
              <radialGradient id={`starGradient-${star.id}`} cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#ffd700" />
                <stop offset="70%" stopColor="#ffa500" />
                <stop offset="100%" stopColor="#ff4500" />
              </radialGradient>
            </defs>
            <path
              d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
              fill={`url(#starGradient-${star.id})`}
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Inner bright core */}
        <div
          className="absolute transition-all duration-300"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) ${hoveredStar === star.id ? 'scale(1.4)' : 'scale(1)'}`,
          }}
        >
          <svg
            width={Math.max(star.size * 4, 8)}
            height={Math.max(star.size * 4, 8)}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
              fill="rgba(255, 255, 255, 0.95)"
            />
          </svg>
          <div className="absolute inset-0">
            {Array.from({ length: 4 }).map((_, i) => {
              const angle = (i * 90) + (hoveredStar === star.id ? 45 : 0);
              const distance = Math.max(star.size * 6, 12);
              const sparkleSize = Math.max(star.size * 1.5, 3);
              return (
                <div
                  key={`sparkle-${i}`}
                  className="absolute transition-all duration-300"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                    opacity: star.brightness * 0.7,
                  }}
                >
                  <div
                    className="animate-pulse"
                    style={{
                      width: `${sparkleSize}px`,
                      height: `${sparkleSize}px`,
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)',
                      borderRadius: '50%',
                      animationDuration: `${1.5 + Math.random() * 2}s`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="absolute animate-pulse"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: star.brightness * 0.6,
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          <svg
            width={Math.max(star.size * 10, 20)}
            height={Math.max(star.size * 10, 20)}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
              fill="rgba(255, 255, 255, 0.4)"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};