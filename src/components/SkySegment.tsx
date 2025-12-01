import React, { useMemo } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface SkySegmentProps {
  segment: number;
  skyOffset: MotionValue<number>;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const SkySegment: React.FC<SkySegmentProps> = ({
  segment,
  skyOffset
}) => {
  const bgStarsTransform = useTransform(
    skyOffset,
    (value) => value * 0.2
  );

  const largeStarsTransform = useTransform(
    skyOffset,
    (value) => value * 0.3
  );

  const clusterTransform = useTransform(
    skyOffset,
    (value) => value * 0.4
  );

  const nebulaTransform = useTransform(
    skyOffset,
    (value) => value * 0.6
  );

  const milkyWayTransform = useTransform(
    skyOffset,
    (value) => value * 0.1
  );

  const bgStars = useMemo(() => {
    return Array.from({ length: 300 }).map((_, i) => {
      const seed = segment * 1000 + i;
      const size = seededRandom(seed) * 2 + 0.5;
      const opacity = seededRandom(seed + 0.1) * 0.8 + 0.2;
      const left = seededRandom(seed + 0.2) * 100;
      const top = seededRandom(seed + 0.3) * 100;

      return {
        key: `bg-star-${segment}-${i}`,
        size,
        opacity,
        left,
        top
      };
    });
  }, [segment]);

  const largeStars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const seed = segment * 2000 + i;
      const size = seededRandom(seed) * 3 + 2;
      const opacity = seededRandom(seed + 0.1) * 0.6 + 0.4;
      const left = seededRandom(seed + 0.2) * 100;
      const top = seededRandom(seed + 0.3) * 100;

      return {
        key: `large-star-${segment}-${i}`,
        size,
        opacity,
        left,
        top
      };
    });
  }, [segment]);

  const clusters = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const seed = segment * 3000 + i;
      const clusterX = seededRandom(seed) * 80 + 10;
      const clusterY = seededRandom(seed + 0.1) * 80 + 10;
      const starCount = Math.floor(seededRandom(seed + 0.2) * 5) + 3;

      const stars = Array.from({ length: starCount }).map((_, j) => {
        const starSeed = seed + 100 + j;
        const offsetX = (seededRandom(starSeed) - 0.5) * 10;
        const offsetY = (seededRandom(starSeed + 0.1) - 0.5) * 10;
        const size = seededRandom(starSeed + 0.2) * 1.5 + 1;

        return {
          key: `cluster-star-${segment}-${i}-${j}`,
          left: clusterX + offsetX,
          top: clusterY + offsetY,
          size
        };
      });

      return {
        key: `cluster-${segment}-${i}`,
        stars
      };
    });
  }, [segment]);

  const nebulas = useMemo(() => {
    return Array.from({ length: 3 }).map((_, i) => {
      const seed = segment * 4000 + i;
      const left = seededRandom(seed) * 60 + 20;
      const top = seededRandom(seed + 0.1) * 60 + 20;
      const width = seededRandom(seed + 0.2) * 200 + 100;
      const height = seededRandom(seed + 0.3) * 200 + 100;
      const isBlue = seededRandom(seed + 0.4) > 0.5;

      return {
        key: `nebula-${segment}-${i}`,
        left,
        top,
        width,
        height,
        color: isBlue ? '100, 150, 255' : '255, 150, 100'
      };
    });
  }, [segment]);

  return (
    <>
      {/* Static background stars */}
      <motion.div
        className="absolute inset-0"
        style={{
          left: 0,
          width: '100%',
          willChange: 'transform',
          x: bgStarsTransform
        }}
      >
        {bgStars.map((star) => (
            <div
              key={star.key}
              className="absolute bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.5})`,
              }}
            />
          ))}
      </motion.div>

      {/* Larger background stars */}
      <motion.div
        className="absolute inset-0"
        style={{
          left: 0,
          width: '100%',
          willChange: 'transform',
          x: largeStarsTransform
        }}
      >
        {largeStars.map((star) => (
            <div
              key={star.key}
              className="absolute bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, ${star.opacity * 0.7})`,
              }}
            />
          ))}
      </motion.div>

      {/* Constellation-like star clusters */}
      <motion.div
        className="absolute inset-0"
        style={{
          left: 0,
          width: '100%',
          willChange: 'transform',
          x: clusterTransform
        }}
      >
        {clusters.map((cluster) => (
            <div key={cluster.key} className="absolute">
              {cluster.stars.map((star) => (
                  <div
                    key={star.key}
                    className="absolute bg-white rounded-full"
                    style={{
                      left: `${star.left}%`,
                      top: `${star.top}%`,
                      width: `${star.size}px`,
                      height: `${star.size}px`,
                      opacity: 0.8,
                      boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.6)`,
                    }}
                  />
                ))}
            </div>
          ))}
      </motion.div>

      {/* Nebula-like clouds */}
      <motion.div
        className="absolute inset-0"
        style={{
          left: 0,
          width: '100%',
          willChange: 'transform',
          x: nebulaTransform
        }}
      >
        {nebulas.map((nebula) => (
          <div
            key={nebula.key}
            className="absolute rounded-full opacity-10"
            style={{
              left: `${nebula.left}%`,
              top: `${nebula.top}%`,
              width: `${nebula.width}px`,
              height: `${nebula.height}px`,
              background: `radial-gradient(circle, rgba(${nebula.color}, 0.3) 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        ))}
      </motion.div>

      {/* Milky Way band */}
      <motion.div
        className="absolute inset-0 opacity-15"
        style={{
          left: 0,
          width: '100%',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 70%)',
          transform: 'rotate(-15deg)',
          willChange: 'transform',
          x: milkyWayTransform
        }}
      />

      {segment === 0 && (
      <div
        className="absolute w-40 h-40"
        style={{
          right: '12%',
          top: '10%',
        }}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.3) 0%, rgba(245, 245, 250, 0.15) 30%, transparent 60%)',
              transform: 'scale(1.8)',
              filter: 'blur(30px)',
            }}
          />

          <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))' }}>
            <defs>
              <radialGradient id="moonSurface" cx="45%" cy="45%">
                <stop offset="0%" style={{ stopColor: '#fffff8', stopOpacity: 1 }} />
                <stop offset="60%" style={{ stopColor: '#f5f5f0', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e8e8dc', stopOpacity: 1 }} />
              </radialGradient>
              <radialGradient id="moonShadow" cx="30%" cy="30%">
                <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.3)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
              </radialGradient>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="100"
              cy="100"
              r="70"
              fill="url(#moonSurface)"
              filter="url(#softGlow)"
            />

            <ellipse
              cx="130"
              cy="100"
              rx="62"
              ry="70"
              fill="#0a1628"
            />

            <circle
              cx="60"
              cy="70"
              r="25"
              fill="url(#moonShadow)"
            />

            <ellipse cx="55" cy="80" rx="6" ry="6" fill="rgba(200,200,190,0.3)" />
            <ellipse cx="45" cy="100" rx="4" ry="4" fill="rgba(200,200,190,0.25)" />
            <ellipse cx="65" cy="115" rx="3" ry="3" fill="rgba(200,200,190,0.2)" />
          </svg>
        </div>
      </div>
      )}
    </>
  );
};
