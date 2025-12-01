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
            radial-gradient(ellipse at top, rgba(30, 27, 75, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(15, 23, 42, 0.6) 0%, transparent 50%),
            linear-gradient(180deg,
              #0f0f23 0%,
              #1a1a2e 25%,
              #16213e 50%,
              #0f3460 75%,
              #000000 100%
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
