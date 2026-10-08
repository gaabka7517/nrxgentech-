import React from 'react';

interface NexGenLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'official' | 'horizontal' | 'emblem' | 'badge';
  showSubtitle?: boolean;
}

export const NexGenLogo: React.FC<NexGenLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  showSubtitle = true,
}) => {
  const sizeMap = {
    xs: { icon: 28, text: 'text-sm', sub: 'text-[9px]', width: 90 },
    sm: { icon: 38, text: 'text-base', sub: 'text-[10px]', width: 120 },
    md: { icon: 50, text: 'text-xl', sub: 'text-xs', width: 160 },
    lg: { icon: 72, text: 'text-2xl', sub: 'text-sm', width: 220 },
    xl: { icon: 100, text: 'text-3xl', sub: 'text-base', width: 280 },
    '2xl': { icon: 140, text: 'text-4xl', sub: 'text-lg', width: 340 },
  };

  const dim = sizeMap[size];

  // The official NexGen Emblem (Exact replica from WhatsApp logo)
  const EmblemSvg = (
    <svg
      width={dim.icon}
      height={dim.icon * 0.85}
      viewBox="0 0 300 255"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-2xs"
    >
      {/* Stylized Laptop Screen in NexGen Green */}
      <rect
        x="38"
        y="65"
        width="224"
        height="132"
        rx="14"
        fill="#FFFFFF"
        stroke="#5ACB00"
        strokeWidth="7.5"
      />

      {/* Screen landscape hills inside display */}
      <path
        d="M 44 158 Q 95 125 155 145 Q 205 160 256 135 L 256 190 L 44 190 Z"
        fill="#5ACB00"
        opacity="0.95"
      />
      <path
        d="M 115 168 Q 165 140 256 155 L 256 190 L 115 190 Z"
        fill="#48A800"
      />

      {/* Laptop Base (Blue on left, Green on right) */}
      <path d="M 14 197 L 150 197 L 150 214 L 24 214 Z" fill="#075A91" />
      <path d="M 150 197 L 286 197 L 276 214 L 150 214 Z" fill="#5ACB00" />
      <rect x="180" y="202" width="38" height="4" rx="2" fill="#FFFFFF" opacity="0.95" />

      {/* Open Book in Center on Screen */}
      <g id="open-book">
        {/* Left Page (Green) */}
        <path
          d="M 148 70 C 130 70 110 80 102 115 L 102 160 C 110 130 130 123 148 123 Z"
          fill="#5ACB00"
        />
        {/* Right Page (Green Base) */}
        <path
          d="M 152 70 C 170 70 190 80 198 115 L 198 160 C 190 130 170 123 152 123 Z"
          fill="#5ACB00"
        />
        {/* Turning White and Blue Layered Leaves */}
        <path
          d="M 152 70 C 165 72 180 82 186 107 L 178 107 C 172 87 160 77 152 75 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 156 83 C 168 85 182 95 188 117 L 181 117 C 175 99 165 90 156 88 Z"
          fill="#075A91"
        />
        <path
          d="M 160 97 C 171 99 184 109 190 129 L 183 129 C 178 113 168 105 160 102 Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Digital Brain Network above Book */}
      <g id="brain-nodes">
        <path
          d="M 125 40 C 112 40 104 48 104 57 C 95 60 95 70 103 74 C 103 83 116 87 129 83 C 135 91 150 91 155 79 C 158 70 151 53 142 46 C 138 41 132 40 125 40 Z"
          fill="#FFFFFF"
          stroke="#5ACB00"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line x1="120" y1="60" x2="140" y2="60" stroke="#075A91" strokeWidth="3.5" />
        <line x1="130" y1="60" x2="130" y2="80" stroke="#5ACB00" strokeWidth="3.5" />
        <circle cx="118" cy="51" r="5.5" fill="#075A91" />
        <circle cx="140" cy="53" r="5" fill="#075A91" />
        <circle cx="130" cy="67" r="4" fill="#5ACB00" />
        <circle cx="144" cy="70" r="4.5" fill="#075A91" />
      </g>

      {/* Dynamic Blue Swoosh Arc */}
      <path
        d="M 52 5 C 26 60 14 145 110 233 C 160 279 240 235 288 200 C 235 243 155 239 105 193 C 58 147 50 77 72 5 Z"
        fill="#075A91"
      />
    </svg>
  );

  // Variant 1: OFFICIAL STACKED LOGO (Identical to WhatsApp Image: Emblem on top, NexGen in Green, Technologies in Blue)
  if (variant === 'official') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {EmblemSvg}
        <div className="flex flex-col items-center mt-1">
          <span
            className="font-black text-[#5ACB00] tracking-tight leading-none"
            style={{ fontSize: dim.text }}
          >
            NexGen
          </span>
          <span
            className="font-bold text-[#075A91] tracking-wide leading-tight -mt-0.5"
            style={{ fontSize: dim.sub }}
          >
            Technologies
          </span>
        </div>
      </div>
    );
  }

  // Variant 2: EMBLEM ONLY
  if (variant === 'emblem') {
    return <div className={`inline-flex items-center ${className}`}>{EmblemSvg}</div>;
  }

  // Variant 3: BADGE (Circular seal with gold/blue accent for certificate certification)
  if (variant === 'badge') {
    return (
      <div className={`relative inline-flex items-center justify-center p-2 rounded-full border-2 border-[#075A91] bg-white shadow-xs ${className}`}>
        {EmblemSvg}
      </div>
    );
  }

  // Variant 4: HORIZONTAL (Emblem on left + "NexGen" in green & "Technologies" in blue on right)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {EmblemSvg}
      <div className="flex flex-col">
        <div className="flex items-baseline leading-none">
          <span className="text-[#5ACB00] font-black tracking-tight" style={{ fontSize: dim.text }}>
            NexGen
          </span>
          <span className="text-[#075A91] ml-1.5 font-bold tracking-tight" style={{ fontSize: dim.text }}>
            Technologies
          </span>
        </div>
        {showSubtitle && (
          <span className="text-gray-400 font-semibold tracking-wider uppercase mt-1" style={{ fontSize: dim.sub }}>
            Certificate Management System
          </span>
        )}
      </div>
    </div>
  );
};
