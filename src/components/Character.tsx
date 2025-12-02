import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface CharacterProps {
  bodyType: 'cat' | 'human' | 'bear' | 'fox';
  gender: 'masculine' | 'feminine' | 'neutral';
  color: string;
  skyOffset: MotionValue<number>;
  isDraggingStar: boolean;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 93, g: 173, b: 226 };
};

const getDarkerShade = (hex: string) => {
  const rgb = hexToRgb(hex);
  return `rgb(${Math.floor(rgb.r * 0.7)}, ${Math.floor(rgb.g * 0.7)}, ${Math.floor(rgb.b * 0.7)})`;
};

export const Character: React.FC<CharacterProps> = ({ bodyType, gender, color, skyOffset, isDraggingStar }) => {
  const darkerColor = getDarkerShade(color);

  const armRotation = useTransform(
    skyOffset,
    [-200, 0, 200],
    [25, 0, -25]
  );

  const armY = useTransform(
    skyOffset,
    [-200, 0, 200],
    [-5, 0, -5]
  );

  const renderCatCharacter = () => {
    if (isDraggingStar) {
      return (
        <>
          <ellipse cx="40" cy="95" rx="25" ry="3" fill="rgba(0,0,0,0.3)" />
          <ellipse cx="40" cy="70" rx="18" ry="22" fill={color} filter="url(#glow)" />
          <circle cx="40" cy="45" r="15" fill={color} filter="url(#glow)" />

          <path d="M 25,35 Q 20,25 25,20 L 30,25 Z" fill={color} filter="url(#glow)" />
          <path d="M 55,35 Q 60,25 55,20 L 50,25 Z" fill={color} filter="url(#glow)" />

          <ellipse cx="10" cy="68" rx="7" ry="16" fill={color} opacity="0.9" />
          <ellipse cx="70" cy="68" rx="7" ry="16" fill={color} opacity="0.9" />

          <rect x="33" y="85" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
          <rect x="41" y="85" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
        </>
      );
    }

    return (
      <>
        <ellipse cx="40" cy="95" rx="25" ry="3" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="40" cy="70" rx="18" ry="22" fill={color} filter="url(#glow)" />
        <circle cx="40" cy="45" r="15" fill={color} filter="url(#glow)" />

        <path d="M 25,35 Q 20,25 25,20 L 30,25 Z" fill={color} filter="url(#glow)" />
        <path d="M 55,35 Q 60,25 55,20 L 50,25 Z" fill={color} filter="url(#glow)" />

        <ellipse cx="35" cy="47" rx="2" ry="3" fill="#1a1a2e" opacity="0.6" />
        <ellipse cx="45" cy="47" rx="2" ry="3" fill="#1a1a2e" opacity="0.6" />
        <path d="M 32,53 Q 40,56 48,53" stroke="#1a1a2e" strokeWidth="1.5" fill="none" opacity="0.4" />

        <motion.g style={{ originX: '10px', originY: '68px', rotate: armRotation, y: armY }}>
          <ellipse cx="10" cy="68" rx="7" ry="16" fill={color} opacity="0.9" />
        </motion.g>

        <ellipse cx="70" cy="68" rx="7" ry="16" fill={color} opacity="0.9" />
        <rect x="33" y="85" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
        <rect x="41" y="85" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
      </>
    );
  };

  const renderHumanCharacter = () => {
    const isFeminine = gender === 'feminine';
    const isMasculine = gender === 'masculine';

    if (isDraggingStar) {
      return (
        <>
          <ellipse cx="40" cy="95" rx="25" ry="3" fill="rgba(0,0,0,0.3)" />
          <ellipse cx="40" cy="72" rx={isFeminine ? 16 : 19} ry={isFeminine ? 20 : 24} fill={color} filter="url(#glow)" />
          <circle cx="40" cy="40" r={isMasculine ? 16 : 14} fill="#ffdbac" filter="url(#glow)" />

          {isFeminine && (
            <path d="M 30,32 Q 25,25 30,22 Q 35,25 40,24 Q 45,25 50,22 Q 55,25 50,32 Z" fill="#4a3728" />
          )}
          {isMasculine && (
            <path d="M 28,35 Q 25,30 28,28 L 35,32 Z M 52,35 Q 55,30 52,28 L 45,32 Z" fill="#4a3728" />
          )}

          <rect x="8" y="56" width="8" height="22" rx="4" fill="#ffdbac" opacity="0.9" />
          <rect x="64" y="56" width="8" height="22" rx="4" fill="#ffdbac" opacity="0.9" />
          <rect x="32" y="88" width="7" height="14" rx="3" fill={darkerColor} opacity="0.9" />
          <rect x="41" y="88" width="7" height="14" rx="3" fill={darkerColor} opacity="0.9" />
        </>
      );
    }

    return (
      <>
        <ellipse cx="40" cy="95" rx="25" ry="3" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="40" cy="72" rx={isFeminine ? 16 : 19} ry={isFeminine ? 20 : 24} fill={color} filter="url(#glow)" />
        <circle cx="40" cy="40" r={isMasculine ? 16 : 14} fill="#ffdbac" filter="url(#glow)" />

        {isFeminine && (
          <path d="M 30,32 Q 25,25 30,22 Q 35,25 40,24 Q 45,25 50,22 Q 55,25 50,32 Z" fill="#4a3728" />
        )}
        {isMasculine && (
          <path d="M 28,35 Q 25,30 28,28 L 35,32 Z M 52,35 Q 55,30 52,28 L 45,32 Z" fill="#4a3728" />
        )}

        <ellipse cx="34" cy="42" rx="2" ry="3" fill="#1a1a2e" opacity="0.8" />
        <ellipse cx="46" cy="42" rx="2" ry="3" fill="#1a1a2e" opacity="0.8" />
        <path d="M 35,48 Q 40,50 45,48" stroke="#d4968f" strokeWidth="1.5" fill="none" opacity="0.6" />

        <motion.g style={{ originX: '12px', originY: '67px', rotate: armRotation, y: armY }}>
          <rect x="8" y="56" width="8" height="22" rx="4" fill="#ffdbac" opacity="0.9" />
        </motion.g>

        <rect x="64" y="56" width="8" height="22" rx="4" fill="#ffdbac" opacity="0.9" />
        <rect x="32" y="88" width="7" height="14" rx="3" fill={darkerColor} opacity="0.9" />
        <rect x="41" y="88" width="7" height="14" rx="3" fill={darkerColor} opacity="0.9" />
      </>
    );
  };

  const renderBearCharacter = () => {
    if (isDraggingStar) {
      return (
        <>
          <ellipse cx="40" cy="95" rx="28" ry="3" fill="rgba(0,0,0,0.3)" />
          <ellipse cx="40" cy="72" rx="22" ry="26" fill={color} filter="url(#glow)" />
          <circle cx="40" cy="42" r="17" fill={color} filter="url(#glow)" />

          <circle cx="28" cy="35" r="6" fill={color} filter="url(#glow)" />
          <circle cx="52" cy="35" r="6" fill={color} filter="url(#glow)" />

          <ellipse cx="8" cy="72" rx="9" ry="14" fill={color} opacity="0.9" />
          <ellipse cx="72" cy="72" rx="9" ry="14" fill={color} opacity="0.9" />
          <rect x="32" y="90" width="7" height="13" rx="3" fill={darkerColor} opacity="0.8" />
          <rect x="41" y="90" width="7" height="13" rx="3" fill={darkerColor} opacity="0.8" />
        </>
      );
    }

    return (
      <>
        <ellipse cx="40" cy="95" rx="28" ry="3" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="40" cy="72" rx="22" ry="26" fill={color} filter="url(#glow)" />
        <circle cx="40" cy="42" r="17" fill={color} filter="url(#glow)" />

        <circle cx="28" cy="35" r="6" fill={color} filter="url(#glow)" />
        <circle cx="52" cy="35" r="6" fill={color} filter="url(#glow)" />

        <ellipse cx="34" cy="44" rx="2.5" ry="3.5" fill="#1a1a2e" opacity="0.7" />
        <ellipse cx="46" cy="44" rx="2.5" ry="3.5" fill="#1a1a2e" opacity="0.7" />
        <ellipse cx="40" cy="50" r="4" fill="#3a2a1a" opacity="0.8" />
        <path d="M 35,52 Q 40,54 45,52" stroke="#1a1a2e" strokeWidth="2" fill="none" opacity="0.5" />

        <motion.g style={{ originX: '8px', originY: '72px', rotate: armRotation, y: armY }}>
          <ellipse cx="8" cy="72" rx="9" ry="14" fill={color} opacity="0.9" />
        </motion.g>

        <ellipse cx="72" cy="72" rx="9" ry="14" fill={color} opacity="0.9" />
        <rect x="32" y="90" width="7" height="13" rx="3" fill={darkerColor} opacity="0.8" />
        <rect x="41" y="90" width="7" height="13" rx="3" fill={darkerColor} opacity="0.8" />
      </>
    );
  };

  const renderFoxCharacter = () => {
    if (isDraggingStar) {
      return (
        <>
          <ellipse cx="40" cy="95" rx="24" ry="3" fill="rgba(0,0,0,0.3)" />
          <ellipse cx="40" cy="70" rx="17" ry="23" fill={color} filter="url(#glow)" />
          <circle cx="40" cy="44" r="14" fill={color} filter="url(#glow)" />

          <path d="M 26,38 Q 22,28 24,22 L 28,30 L 32,36 Z" fill={color} filter="url(#glow)" />
          <path d="M 54,38 Q 58,28 56,22 L 52,30 L 48,36 Z" fill={color} filter="url(#glow)" />
          <path d="M 28,32 L 24,24 L 26,22 L 30,28 Z" fill="white" opacity="0.7" />
          <path d="M 52,32 L 56,24 L 54,22 L 50,28 Z" fill="white" opacity="0.7" />

          <ellipse cx="11" cy="70" rx="7" ry="13" fill={color} opacity="0.9" />
          <ellipse cx="69" cy="70" rx="7" ry="13" fill={color} opacity="0.9" />
          <rect x="34" y="86" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
          <rect x="40" y="86" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
        </>
      );
    }

    return (
      <>
        <ellipse cx="40" cy="95" rx="24" ry="3" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="40" cy="70" rx="17" ry="23" fill={color} filter="url(#glow)" />
        <circle cx="40" cy="44" r="14" fill={color} filter="url(#glow)" />

        <path d="M 26,38 Q 22,28 24,22 L 28,30 L 32,36 Z" fill={color} filter="url(#glow)" />
        <path d="M 54,38 Q 58,28 56,22 L 52,30 L 48,36 Z" fill={color} filter="url(#glow)" />
        <path d="M 28,32 L 24,24 L 26,22 L 30,28 Z" fill="white" opacity="0.7" />
        <path d="M 52,32 L 56,24 L 54,22 L 50,28 Z" fill="white" opacity="0.7" />

        <ellipse cx="35" cy="46" rx="2" ry="3" fill="#1a1a2e" opacity="0.7" />
        <ellipse cx="45" cy="46" rx="2" ry="3" fill="#1a1a2e" opacity="0.7" />
        <path d="M 35,52 L 40,54 L 45,52" stroke="#1a1a2e" strokeWidth="1.5" fill="none" opacity="0.5" />

        <motion.g style={{ originX: '11px', originY: '70px', rotate: armRotation, y: armY }}>
          <ellipse cx="11" cy="70" rx="7" ry="13" fill={color} opacity="0.9" />
        </motion.g>

        <ellipse cx="69" cy="70" rx="7" ry="13" fill={color} opacity="0.9" />
        <rect x="34" y="86" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
        <rect x="40" y="86" width="6" height="12" rx="3" fill={darkerColor} opacity="0.8" />
      </>
    );
  };

  const renderCharacter = () => {
    switch (bodyType) {
      case 'cat': return renderCatCharacter();
      case 'human': return renderHumanCharacter();
      case 'bear': return renderBearCharacter();
      case 'fox': return renderFoxCharacter();
      default: return renderCatCharacter();
    }
  };

  return (
    <motion.div
      className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none"
      animate={{
        rotateY: isDraggingStar ? 180 : 0
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut"
      }}
    >
      <svg width="80" height="100" viewBox="0 0 80 100" className="drop-shadow-2xl">
        <defs>
          <linearGradient id="characterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: darkerColor, stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {renderCharacter()}
      </svg>
    </motion.div>
  );
};
