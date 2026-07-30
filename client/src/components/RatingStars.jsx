import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating, max = 5 }) {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'fill-temple-brass text-temple-brass' : 'fill-weathered-stone text-dust-beige'}`}
        />
      ))}
    </div>
  );
}
