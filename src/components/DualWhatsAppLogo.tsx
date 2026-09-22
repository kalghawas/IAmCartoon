import React from 'react';

interface DualWhatsAppLogoProps {
  className?: string;
  size?: number;
}

export const DualWhatsAppLogo: React.FC<DualWhatsAppLogoProps> = ({
  className = 'w-9 h-9',
  size = 36,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="I Am whatsapp logo"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Left-facing WhatsApp bubble (Tail points LEFT, deep teal #075E54 / #128C7E) */}
        <path
          d="M13 10H27C30.3137 10 33 12.6863 33 16V23C33 26.3137 30.3137 29 27 29H14L7 34V27.8C4.55 26.5 3 23.9 3 21V16C3 12.6863 5.6863 10 9 10Z"
          fill="#075e54"
          opacity="0.95"
        />
        {/* Subtle accent dots in left bubble */}
        <circle cx="12" cy="19.5" r="1.25" fill="#25D366" opacity="0.9" />
        <circle cx="17" cy="19.5" r="1.25" fill="#25D366" opacity="0.9" />
        <circle cx="22" cy="19.5" r="1.25" fill="#25D366" opacity="0.9" />

        {/* Right-facing WhatsApp bubble (Tail points RIGHT, vibrant emerald #25D366, overlapping in the center) */}
        <path
          d="M21 17H35C38.3137 17 41 19.6863 41 23V29C41 31.9 39.45 34.5 37 35.8V42L30 37H21C17.6863 37 15 34.3137 15 31V23C15 19.6863 17.6863 17 21 17Z"
          fill="#25D366"
          stroke="#090e11"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Clean white dots in right bubble */}
        <circle cx="25" cy="27" r="1.35" fill="#ffffff" />
        <circle cx="29.5" cy="27" r="1.35" fill="#ffffff" />
        <circle cx="34" cy="27" r="1.35" fill="#ffffff" />
      </svg>
    </div>
  );
};
