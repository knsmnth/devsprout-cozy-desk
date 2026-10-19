"use client";

import React from "react";

// Pre-defined apple positions matching the user's sample artwork:
// - Apples 1-3: Resting horizontally across the rim (Photo 1)
// - Apples 4-6: Pyramiding into the handle arch (Photo 2)
// - Apples 7-8: Filling inner crevices
// - Apples 9-15: Overflowing on the sides and along the bottom front (Photo 3)
const APPLE_POSITIONS = [
  // Layer: Inside basket (Behind rim & body, in front of handle)
  { x: 80, y: 64, scale: 0.95, rotate: -2, isFront: false }, // 1: center bottom
  { x: 58, y: 65, scale: 0.92, rotate: -8, isFront: false }, // 2: left bottom
  { x: 102, y: 65, scale: 0.92, rotate: 6, isFront: false }, // 3: right bottom
  { x: 69, y: 50, scale: 0.94, rotate: -5, isFront: false }, // 4: mid left
  { x: 91, y: 50, scale: 0.94, rotate: 5, isFront: false }, // 5: mid right
  { x: 80, y: 35, scale: 0.96, rotate: 2, isFront: false }, // 6: top center
  { x: 49, y: 54, scale: 0.88, rotate: -12, isFront: false }, // 7: inner left
  { x: 111, y: 54, scale: 0.88, rotate: 12, isFront: false }, // 8: inner right

  // Layer: Outside / Overflow (In front of basket body & base)
  { x: 26, y: 84, scale: 0.94, rotate: -18, isFront: true }, // 9: left rim spill
  { x: 134, y: 84, scale: 0.94, rotate: 18, isFront: true }, // 10: right rim spill
  { x: 25, y: 110, scale: 0.95, rotate: 10, isFront: true }, // 11: left base
  { x: 135, y: 110, scale: 0.95, rotate: -10, isFront: true }, // 12: right base
  { x: 44, y: 125, scale: 0.96, rotate: -6, isFront: true }, // 13: front left
  { x: 79, y: 128, scale: 1.0, rotate: 3, isFront: true }, // 14: front center
  { x: 114, y: 125, scale: 0.96, rotate: 12, isFront: true }, // 15: front right
];

function AppleGraphic({ x, y, scale = 1, rotate = 0 }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}>
      {/* Stem */}
      <path
        d="M 0,-9 C -1,-14 -3,-18 -6,-21 C -4,-21 -1.5,-16 1.5,-10 Z"
        fill="#5D3A1A"
        stroke="#42250F"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Leaf */}
      <path
        d="M 1,-12 C 5,-19 13,-18 15,-13 C 14,-9 7,-9 1,-12 Z"
        fill="#2E7D32"
        stroke="#1B5E20"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Apple Body */}
      <path
        d="M 0,-8
           C 4.5,-13 13.5,-12 14.5,-3
           C 15.5,5 12,12.5 5,14
           C 2,14.8 0,13.2 -2,14.8
           C -9,13.2 -15.5,5 -14.5,-3
           C -13.5,-12 -4.5,-13 0,-8 Z"
        fill="url(#appleGradient)"
        stroke="#A71515"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* Specular Shine Highlight */}
      <path
        d="M -7,-5 C -5,-8.5 -2,-8.5 -1,-7.5 C -4,-5.5 -6,-1.5 -7,1.5 C -8,0.5 -8,-2.5 -7,-5 Z"
        fill="#FFFFFF"
        opacity="0.65"
      />
    </g>
  );
}

export default function AppleBasket({ count = 0, isBouncing = false, width = 88, height = 84 }) {
  const visibleCount = Math.min(count, 15);
  const extraCount = count > 15 ? count - 15 : 0;

  const insideApples = APPLE_POSITIONS.slice(0, Math.min(visibleCount, 8));
  const frontApples = visibleCount > 8 ? APPLE_POSITIONS.slice(8, visibleCount) : [];

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
        userSelect: "none",
        transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <svg
        viewBox="0 0 160 148"
        width={width}
        height={height}
        style={{
          overflow: "visible",
          filter: "drop-shadow(0 3px 6px rgba(90, 50, 20, 0.12))",
        }}
      >
        <defs>
          {/* Apple Red Gradient */}
          <radialGradient id="appleGradient" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FF4F4F" />
            <stop offset="65%" stopColor="#E51414" />
            <stop offset="100%" stopColor="#9C0A0A" />
          </radialGradient>

          {/* Wicker Lattice Weave Pattern */}
          <pattern id="wickerLattice" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="#F3A83B" />
            <path
              d="M 0,0 L 12,12 M 12,0 L 0,12"
              stroke="#BD721E"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
          </pattern>
        </defs>

        {/* 1. Basket Handle (Arch in background) */}
        <path
          d="M 44, 72 C 44, 20 116, 20 116, 72"
          fill="none"
          stroke="#F3A83B"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 44, 72 C 44, 20 116, 20 116, 72"
          fill="none"
          stroke="#D9822B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 2. Apples Inside Basket (behind rim & front wall) */}
        {insideApples.map((pos, idx) => (
          <AppleGraphic
            key={`inside-${idx}`}
            x={pos.x}
            y={pos.y}
            scale={pos.scale}
            rotate={pos.rotate}
          />
        ))}

        {/* 3. Basket Body (Wicker Lattice) */}
        <polygon
          points="37,70 123,70 111,122 49,122"
          fill="url(#wickerLattice)"
          stroke="#C47720"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 4. Basket Rim (Horizontal Bar) */}
        <rect
          x="32"
          y="65"
          width="96"
          height="8"
          rx="4"
          fill="#F5B24E"
          stroke="#D9822B"
          strokeWidth="1.5"
        />
        {/* Subtle rim highlight */}
        <line
          x1="36"
          y1="67.5"
          x2="124"
          y2="67.5"
          stroke="#FFF0D0"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* 5. Basket Base Footer */}
        <rect
          x="46"
          y="120"
          width="68"
          height="7"
          rx="3.5"
          fill="#9C5213"
          stroke="#7A3C08"
          strokeWidth="1.2"
        />

        {/* 6. Overflow Apples (in front of basket body and sides) */}
        {frontApples.map((pos, idx) => (
          <AppleGraphic
            key={`front-${idx}`}
            x={pos.x}
            y={pos.y}
            scale={pos.scale}
            rotate={pos.rotate}
          />
        ))}
      </svg>

      {/* Extra Count Badge for > 15 */}
      {extraCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            background: "linear-gradient(135deg, #e52521 0%, #b71c1c 100%)",
            color: "#ffffff",
            fontSize: "0.68rem",
            fontWeight: 800,
            borderRadius: "9999px",
            padding: "1px 6px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
            border: "1.5px solid #ffffff",
            zIndex: 10,
          }}
          title={`${count} total apples harvested`}
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
}
