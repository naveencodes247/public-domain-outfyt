import React from 'react';

interface OutFytLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'badge';
  theme?: 'light' | 'dark';
  className?: string;
  onClick?: () => void;
}

export const OutFytLogo: React.FC<OutFytLogoProps> = ({
  size = 'md',
  variant = 'compact',
  theme = 'light',
  className = '',
  onClick,
}) => {
  // Dimension mapping
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 36
      : size === 'md'
      ? 46
      : size === 'lg'
      ? 64
      : 130;

  // Render the circular emblem SVG
  const renderCircularEmblem = (dim: number) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
      aria-label="OutFyt.co.in Logo"
    >
      {/* Outer Dark Backplate */}
      <circle cx="120" cy="120" r="118" fill="#111111" />

      {/* Champagne Gold Outer Ring */}
      <circle
        cx="120"
        cy="120"
        r="110"
        stroke="#CDA66B"
        strokeWidth="6"
        fill="none"
      />

      {/* Warm Ivory Disc */}
      <circle cx="120" cy="120" r="104" fill="#F5EBDD" />

      {/* Top Clothes Hanger Vector */}
      <g stroke="#111111" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Hook */}
        <path d="M120 48 C115 48 112 52 112 56 C112 62 120 65 120 70 L120 74" />
        {/* Hanger Shoulder Frame */}
        <path d="M120 74 L84 94 C82 95 82 98 84 99 L87 100 L153 100 L156 99 C158 98 158 95 156 94 Z" />
      </g>

      {/* "outFyt" Typography */}
      <g fill="#111111" textAnchor="middle" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
        <text
          x="120"
          y="146"
          fontSize="48"
          fontWeight="700"
          letterSpacing="-0.5"
        >
          <tspan style={{ fontStyle: 'italic', fontWeight: '500' }}>out</tspan>
          <tspan fontSize="56" fontWeight="800" dy="1">F</tspan>
          <tspan style={{ fontStyle: 'italic', fontWeight: '500' }} dy="-1">yt</tspan>
        </text>
      </g>

      {/* "F A S H I O N   F I N D S" */}
      <text
        x="120"
        y="172"
        fill="#111111"
        fontSize="10"
        fontWeight="600"
        letterSpacing="4"
        textAnchor="middle"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        FASHION FINDS
      </text>

      {/* Divider line with central sparkle diamond */}
      <g stroke="#111111" strokeWidth="1" fill="#111111">
        <line x1="82" y1="187" x2="110" y2="187" />
        {/* Sparkle 4-point diamond */}
        <path d="M120 181 L122.5 187 L120 193 L117.5 187 Z" />
        <line x1="130" y1="187" x2="158" y2="187" />
      </g>
    </svg>
  );

  if (variant === 'full' || variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer select-none group ${className}`}
      >
        {renderCircularEmblem(pixelSize)}
      </div>
    );
  }

  // Compact Header / Nav Bar variant
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#171717]';
  const subtitleColor = theme === 'dark' ? 'text-[#CDA66B]' : 'text-[#A77B3D]';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      {renderCircularEmblem(pixelSize)}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-editorial text-xl sm:text-2xl font-bold tracking-tight ${textColor} group-hover:text-[#A77B3D] transition-colors leading-none`}>
            OutFyt<span className="text-[#CDA66B]">.</span><span className="text-[#66615B] text-xs font-normal">co.in</span>
          </span>
        </div>
        <span className={`text-[8.5px] tracking-[0.25em] font-semibold uppercase ${subtitleColor} leading-tight mt-0.5`}>
          Fashion Finds
        </span>
      </div>
    </div>
  );
};

export default OutFytLogo;
