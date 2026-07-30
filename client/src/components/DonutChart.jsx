import React from 'react';

export default function DonutChart({ fulfilled, delayed, broken, total }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  const fulfilledPercent = fulfilled / total;
  const delayedPercent = delayed / total;
  const brokenPercent = broken / total;

  const fulfilledDash = fulfilledPercent * circumference;
  const delayedDash = delayedPercent * circumference;
  const brokenDash = brokenPercent * circumference;

  const fulfilledOffset = 0;
  const delayedOffset = -fulfilledDash;
  const brokenOffset = delayedOffset - delayedDash;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#E4DCC8" /* weathered-stone */
          strokeWidth="16"
        />
        {/* Fulfilled */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#4F6B45" /* Rhododendron Green */
          strokeWidth="16"
          strokeDasharray={`${fulfilledDash} ${circumference}`}
          strokeDashoffset={fulfilledOffset}
          className="transition-all duration-500 ease-in-out"
        />
        {/* Delayed */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#8C6A32" /* Turmeric Clay */
          strokeWidth="16"
          strokeDasharray={`${delayedDash} ${circumference}`}
          strokeDashoffset={delayedOffset}
          className="transition-all duration-500 ease-in-out"
        />
        {/* Broken */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#6E4438" /* Charred Brick */
          strokeWidth="16"
          strokeDasharray={`${brokenDash} ${circumference}`}
          strokeDashoffset={brokenOffset}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-serif text-pagoda-wood font-bold">{total}</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-basalt">Promises</span>
      </div>
    </div>
  );
}
