import React from 'react';

interface KnightLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * Animated Arabian Horse Logo + "فارس TOOLS" Wordmark:
 * Features an authentic proud Arabian horse head with an arched neck, dished profile,
 * alert pointed ears, and flowing animated mane waves inside a royal blue crest.
 */
export const KnightLogo: React.FC<KnightLogoProps> = ({
  className = '',
  size = 42,
  animate = true,
  showWordmark = false,
  wordmarkClassName = '',
}) => {
  const rawId = React.useId().replace(/:/g, '');
  const shieldGradId = `arabianShieldGrad-${rawId}`;
  const maneGradId = `arabianManeGrad-${rawId}`;
  const shimmerGradId = `shimmerLinear-${rawId}`;

  return (
    <span className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 overflow-hidden rounded-2xl shadow-[0_4px_14px_rgba(23,105,255,0.28)] transition-transform duration-300 group-hover:scale-105"
        role="img"
        aria-label="شعار فارس TOOLS - الحصان العربي الأصيل"
      >
        <defs>
          <linearGradient
            id={shieldGradId}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1769FF" />
            <stop offset="55%" stopColor="#0755E9" />
            <stop offset="100%" stopColor="#053BA6" />
          </linearGradient>

          <linearGradient
            id={maneGradId}
            x1="34"
            y1="10"
            x2="56"
            y2="54"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="50%" stopColor="#38A5FF" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          <linearGradient
            id={shimmerGradId}
            x1="0"
            y1="0"
            x2="30"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Royal Emblem */}
        <rect width="64" height="64" rx="16" fill={`url(#${shieldGradId})`} />

        {/* Subtle Inner Arabesque Ring */}
        <circle
          cx="32"
          cy="32"
          r="25"
          stroke="#FFFFFF"
          strokeOpacity="0.16"
          strokeWidth="1.2"
        />

        {/* Animated Shimmer Sweep */}
        {animate && (
          <rect
            x="-10"
            y="-10"
            width="24"
            height="84"
            fill={`url(#${shimmerGradId})`}
            className="animate-badge-shimmer pointer-events-none"
          />
        )}

        {/* Animated Arabian Horse Group */}
        <g className={animate ? 'animate-horse-prance' : ''}>
          {/* Flowing Wind-Swept Arabian Mane Waves (Back Layer) */}
          <g className={animate ? 'animate-mane-wave' : ''}>
            <path
              d="M35 12C43 13 51 18 53 25C48 24 44 25 41 28C48 29 53 34 54 41C49 39 45 40 42 43C46 45 49 49 49 54H36L35 12Z"
              fill={`url(#${maneGradId})`}
              opacity="0.92"
            />
            <path
              d="M37 17C44 19 49 23 50 28C45 27 42 28 39 31"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* Proud Arabian Stallion Head & Arched Neck Silhouette (Dished Profile Facing Left/Forward in RTL) */}
          <path
            d="M43 54H20.5C21.5 46.5 24.5 40.5 28.5 36.5C29.5 35.5 29.2 34 27.8 33.8C23.2 33.4 18.8 35.2 15.5 35.2C12.8 35.2 10.5 33.2 10.5 30.4C10.5 28.6 11.6 27 13.2 25.8C16.2 23.5 18.2 20.2 19.8 16.5L22.5 9.5L25.8 14.2L29.5 8.5L31.2 14.8C38.5 19.2 43.5 28.5 44 39.5C44.2 44.8 43.6 49.8 43 54Z"
            fill="#FFFFFF"
          />

          {/* Noble Expressive Eye & Nostril Detail */}
          <path
            d="M20.5 22.2C21.8 21.4 23.6 21.6 24.5 22.8C23.2 23.5 21.5 23.3 20.5 22.2Z"
            fill="#0755E9"
          />
          <circle cx="14.2" cy="30.2" r="1.2" fill="#0755E9" />

          {/* Elegant Arabian Bridle / Golden-Cyan Cheek Accent Line */}
          <path
            d="M15.5 32.2C20.5 31.2 25.5 28.8 29.5 24.5"
            stroke="#38A5FF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>

        {/* Bottom Pedestal Accent Bar */}
        <rect
          x="18"
          y="55.5"
          width="28"
          height="2.8"
          rx="1.4"
          fill="#38A5FF"
        />
      </svg>

      {showWordmark && (
        <span
          className={`inline-flex items-baseline gap-1.5 whitespace-nowrap leading-none ${wordmarkClassName}`}
        >
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
            فارس
          </span>
          <span className="font-en text-base sm:text-lg font-extrabold tracking-wider text-[#1769FF] bg-[#EAF3FF] dark:bg-[#1769FF]/25 dark:text-[#38A5FF] px-2 py-0.5 rounded-lg">
            TOOLS
          </span>
        </span>
      )}
    </span>
  );
};
