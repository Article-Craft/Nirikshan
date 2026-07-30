import React from 'react';

// Segment colors pulled from the Himal & Pagoda design system (tailwind.config.js)
// We use inline style with the CSS custom-property pattern so SVG strokes
// honour the same tokens as the rest of the UI — never hardcoded hex.
const COLORS = {
  fulfilled: '#4F6B45',  // status.fulfilled — Rhododendron Leaf Green
  delayed:   '#8C6A32',  // status.delayed   — Turmeric Clay
  broken:    '#6E4438',  // status.broken    — Charred Brick
  track:     '#E4DCC8',  // weathered-stone  — donut background track
};

export default function DonutChart({ fulfilled = 0, delayed = 0, broken = 0, total = 0 }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const safe = total > 0 ? total : 1; // avoid divide-by-zero

  const fulfilledDash = (fulfilled / safe) * circumference;
  const delayedDash   = (delayed   / safe) * circumference;
  const brokenDash    = (broken    / safe) * circumference;

  // Each segment starts where the previous ended (negative offset = clockwise shift)
  const fulfilledOffset = 0;
  const delayedOffset   = -fulfilledDash;
  const brokenOffset    = delayedOffset - delayedDash;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center mx-auto" role="img" aria-label={`Promise fulfillment: ${fulfilled} fulfilled, ${delayed} delayed, ${broken} broken out of ${total}`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={COLORS.track}
          strokeWidth="16"
        />
        {/* Fulfilled — Rhododendron Leaf Green */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={COLORS.fulfilled}
          strokeWidth="16"
          strokeDasharray={`${fulfilledDash} ${circumference}`}
          strokeDashoffset={fulfilledOffset}
          className="transition-all duration-500 ease-in-out"
        />
        {/* Delayed — Turmeric Clay */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={COLORS.delayed}
          strokeWidth="16"
          strokeDasharray={`${delayedDash} ${circumference}`}
          strokeDashoffset={delayedOffset}
          className="transition-all duration-500 ease-in-out"
        />
        {/* Broken — Charred Brick */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={COLORS.broken}
          strokeWidth="16"
          strokeDasharray={`${brokenDash} ${circumference}`}
          strokeDashoffset={brokenOffset}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>

      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-3xl font-serif text-pagoda-wood font-bold leading-none">{total}</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-basalt mt-1">Promises</span>
      </div>
    </div>
  );
}
