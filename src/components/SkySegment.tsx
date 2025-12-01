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
          left: `${segment * 100 - 100}%`,
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
          left: `${segment * 100 - 100}%`,
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
          left: `${segment * 100 - 100}%`,
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
          left: `${segment * 100 - 100}%`,
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
          left: `${segment * 100 - 100}%`,
          width: '100%',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 70%)',
          rotate: '-15deg',
          willChange: 'transform',
          x: milkyWayTransform
        }}
      />

      {/* Moon */}
      <motion.div
        className="absolute w-24 h-24"
        style={{
          right: '10%',
          top: '10%',
          left: segment === 0 ? '80%' : '-200%',
          willChange: 'transform'
        }}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute w-full h-full rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(220, 220, 255, 0.4) 0%, rgba(180, 180, 220, 0.2) 40%, transparent 70%)',
              transform: 'scale(1.8)',
              filter: 'blur(8px)',
            }}
          />
          
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `
                radial-gradient(ellipse at 30% 25%, rgba(255, 255, 255, 0.9) 0%, transparent 25%),
                radial-gradient(ellipse at 65% 40%, rgba(240, 240, 240, 0.6) 0%, transparent 20%),
                radial-gradient(ellipse at 45% 70%, rgba(220, 220, 220, 0.4) 0%, transparent 15%),
                radial-gradient(ellipse at 20% 60%, rgba(200, 200, 200, 0.3) 0%, transparent 12%),
                radial-gradient(ellipse at 75% 25%, rgba(210, 210, 210, 0.3) 0%, transparent 10%),
                radial-gradient(circle at 35% 30%, #f8f8f8 0%, #e8e8e8 25%, #d0d0d0 50%, #b8b8b8 75%, #a0a0a0 100%)
              `,
              boxShadow: `
                0 0 20px rgba(245, 245, 255, 0.6),
                0 0 40px rgba(220, 220, 255, 0.3),
                inset -10px -10px 20px rgba(0, 0, 0, 0.3),
                inset 5px 5px 15px rgba(255, 255, 255, 0.2)
              `,
            }}
          >
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {/* Large crater */}
              <div
                className="absolute rounded-full opacity-40"
                style={{
                  width: '18px',
                  height: '18px',
                  left: '45%',
                  top: '35%',
                  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 40%, transparent 70%)',
                  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              />
              
              {/* Medium craters */}
              <div
                className="absolute rounded-full opacity-30"
                style={{
                  width: '12px',
                  height: '12px',
                  left: '25%',
                  top: '50%',
                  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, transparent 80%)',
                  boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.2)',
                }}
              />
              
              <div
                className="absolute rounded-full opacity-25"
                style={{
                  width: '8px',
                  height: '8px',
                  left: '65%',
                  top: '60%',
                  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, transparent 80%)',
                  boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.2)',
                }}
              />
              
              {/* Small craters */}
              <div
                className="absolute rounded-full opacity-20"
                style={{
                  width: '6px',
                  height: '6px',
                  left: '35%',
                  top: '65%',
                  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 0%, transparent 70%)',
                  boxShadow: 'inset 1px 1px 1px rgba(0, 0, 0, 0.1)',
                }}
              />
              
              <div
                className="absolute rounded-full opacity-15"
                style={{
                  width: '4px',
                  height: '4px',
                  left: '55%',
                  top: '25%',
                  background: 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 0%, transparent 70%)',
                }}
              />
              
              {/* Mare (dark patches) */}
              <div
                className="absolute opacity-20"
                style={{
                  width: '20px',
                  height: '15px',
                  left: '20%',
                  top: '25%',
                  background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%)',
                  borderRadius: '60% 40% 70% 30%',
                  transform: 'rotate(-15deg)',
                }}
              />
              
              <div
                className="absolute opacity-15"
                style={{
                  width: '16px',
                  height: '12px',
                  left: '50%',
                  top: '45%',
                  background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 70%, transparent 100%)',
                  borderRadius: '50% 60% 40% 70%',
                  transform: 'rotate(25deg)',
                }}
              />
              
              {/* Bright highlands */}
              <div
                className="absolute opacity-30"
                style={{
                  width: '14px',
                  height: '10px',
                  left: '60%',
                  top: '20%',
                  background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 60%, transparent 100%)',
                  borderRadius: '70% 30% 60% 40%',
                  transform: 'rotate(45deg)',
                }}
              />
            </div>
          </div>
          
          <div className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`moon-ray-${i}`}
                className="absolute opacity-10"
                style={{
                  width: '1px',
                  height: '60px',
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
                  left: '50%',
                  top: '50%',
                  transformOrigin: '0 0',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};