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
        className="absolute w-32 h-32"
        style={{
          right: '15%',
          top: '12%',
        }}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(220, 220, 255, 0.2) 40%, transparent 70%)',
              transform: 'scale(2)',
              filter: 'blur(20px)',
            }}
          />

          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e8e8e8', stopOpacity: 0.9 }} />
              </radialGradient>
              <filter id="moonBlur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              </filter>
            </defs>

            <circle cx="50" cy="50" r="45" fill="url(#moonGlow)" filter="url(#moonBlur)" />

            <ellipse
              cx="70"
              cy="50"
              rx="40"
              ry="45"
              fill="#0a1628"
              opacity="0.8"
            />

            <ellipse cx="35" cy="40" rx="4" ry="4" fill="rgba(0,0,0,0.2)" />
            <ellipse cx="28" cy="55" rx="3" ry="3" fill="rgba(0,0,0,0.15)" />
            <ellipse cx="40" cy="65" rx="2" ry="2" fill="rgba(0,0,0,0.1)" />
          </svg>
        </div>
      </div>
      )}
    </>
  );
};
