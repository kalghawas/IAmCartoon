import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-10 h-10 text-blue-500',
  size,
  color = 'currentColor'
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="I am Cartoon Logo"
    >
      {/* Left side: Realistic human portrait contour */}
      <path
        d="M 22 6 C 14 6 8 13 8 24 C 8 33 14 41 22 42"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Realistic human eye */}
      <path
        d="M 12 19 Q 16 18 19 20"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="23" r="2" fill={color} />

      {/* Center transformation magic dotted line */}
      <line
        x1="24"
        y1="4"
        x2="24"
        y2="44"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="2 3"
        opacity="0.8"
      />

      {/* Right side: Expressive animated cartoon face contour */}
      <path
        d="M 26 6 C 35 4 44 11 44 21 C 46 26 44 33 39 37 C 34 41 29 42 26 42"
        stroke={color}
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Cartoon eye with twinkle reflection */}
      <ellipse cx="34" cy="18" rx="4.5" ry="5.5" fill={color} />
      <circle cx="35.5" cy="16.5" r="1.8" fill="#ffffff" />
      
      {/* Playful cartoon smile */}
      <path
        d="M 27 28 Q 34 37 41 28"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Cheek blush */}
      <circle cx="40" cy="27" r="2.2" fill={color} />
    </svg>
  );
};
