import React from 'react';

/**
 * WoodenDeskBackground: High-fidelity warm polished cherry/amber oak wooden desk
 * matching the user's reference photograph.
 * Includes horizontal wood grain fibers, natural knot whorls, organic wood ripples,
 * and ambient desk lamp vignette.
 */
export const WoodenDeskBackground: React.FC = () => {
  return (
    <div
      id="wooden-desk-canvas"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-50 overflow-hidden select-none bg-[#742F0C]"
      style={{
        backgroundColor: '#742F0C',
      }}
    >
      {/* 1. Base Multi-stop Rich Amber/Cherry Wood Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 85% 70% at 50% 45%, 
              #A44E18 0%, 
              #8E3D12 30%, 
              #762F0B 55%, 
              #582006 78%, 
              #361203 92%,
              #1C0801 100%
            )
          `,
        }}
      />

      {/* 2. Horizontal Wood Planks & Grain Fibers (Multi-frequency linear striations) */}
      <div
        className="absolute inset-0 opacity-75"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgba(35, 12, 3, 0.18) 2px,
              rgba(35, 12, 3, 0.18) 3px,
              transparent 3px,
              transparent 7px,
              rgba(255, 185, 100, 0.06) 7px,
              rgba(255, 185, 100, 0.06) 8px
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 14px,
              rgba(20, 6, 2, 0.22) 14px,
              rgba(20, 6, 2, 0.22) 16px,
              transparent 16px,
              transparent 38px,
              rgba(255, 200, 120, 0.05) 38px,
              rgba(255, 200, 120, 0.05) 40px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.04) 0px,
              rgba(0, 0, 0, 0.12) 60px,
              rgba(255, 160, 60, 0.05) 120px,
              rgba(0, 0, 0, 0.04) 180px
            )
          `,
        }}
      />

      {/* 3. Authentic SVG Procedural Wood Grain Waves & Knot Texture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Anisotropic horizontal wood grain filter */}
          <filter id="authentic-wood-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.003 0.08"
              numOctaves="4"
              seed="19"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="
                0.40 0 0 0 0.45
                0.20 0 0 0 0.22
                0.08 0 0 0 0.08
                0    0 0 1 0"
              in="noise"
              result="coloredGrain"
            />
          </filter>

          {/* Knot turbulence filter */}
          <filter id="wood-knot-swirl" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="radialNoise"
              baseFrequency="0.03 0.015"
              numOctaves="3"
              seed="7"
              result="knotNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="knotNoise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* Full-width procedural grain fill */}
        <rect width="100%" height="100%" filter="url(#authentic-wood-grain)" fill="#8A3C10" />

        {/* Natural Wood Knot on Left Side (matching reference image) */}
        <g opacity="0.45" filter="url(#wood-knot-swirl)">
          <ellipse
            cx="8%"
            cy="42%"
            rx="48"
            ry="24"
            fill="none"
            stroke="#2B0C02"
            strokeWidth="3.5"
            transform="rotate(-8, 64, 300)"
          />
          <ellipse
            cx="8%"
            cy="42%"
            rx="32"
            ry="16"
            fill="none"
            stroke="#1F0801"
            strokeWidth="4"
            transform="rotate(-8, 64, 300)"
          />
          <ellipse
            cx="8%"
            cy="42%"
            rx="16"
            ry="8"
            fill="#1E0701"
            transform="rotate(-8, 64, 300)"
          />
        </g>

        {/* Natural subtle grain swirl on Right Side */}
        <g opacity="0.3" filter="url(#wood-knot-swirl)">
          <ellipse
            cx="93%"
            cy="58%"
            rx="60"
            ry="30"
            fill="none"
            stroke="#2E0E03"
            strokeWidth="3"
            transform="rotate(6, 1200, 450)"
          />
          <ellipse
            cx="93%"
            cy="58%"
            rx="40"
            ry="18"
            fill="none"
            stroke="#1D0801"
            strokeWidth="2.5"
            transform="rotate(6, 1200, 450)"
          />
        </g>
      </svg>

      {/* 4. Fine Surface Wood Pores & Satin Polish Sheen */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(255, 210, 140, 0.25) 0%, 
              transparent 45%, 
              rgba(0, 0, 0, 0.4) 100%
            )
          `,
        }}
      />

      {/* 5. Deep Perimeter Vignette (Darkening at outer margins matching reference photo) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 95% 85% at 50% 50%, 
              transparent 45%, 
              rgba(40, 14, 4, 0.45) 75%, 
              rgba(18, 6, 2, 0.85) 95%,
              rgba(8, 2, 0, 0.95) 100%
            )
          `,
        }}
      />
    </div>
  );
};
