# Nirikshan Design & Animation Guidelines

## Core Philosophy
- Maintain a highly professional, trustworthy, and authoritative watchdog aesthetic.
- Avoid distracting or exaggerated animations (no bouncing, elastic easing, spinning icons, or particle effects).
- Motion must serve to clarify data transitions and layout relationships.

## Implementation Rules
1. **CSS Transitions:** Use standard CSS transitions for hover effects, fades, and microinteractions.
2. **GSAP:** Limit GSAP to complex animations (page transitions, scroll storytelling, map animations).
3. **CSS Keyframes:** Use for simple loading, skeleton shimmers, or pulsing animations.
4. **Theme Transitions:** Use smooth color interpolations rather than instant changes.

## Specific Animation Directives

### 1. Hero Entrance
- Background map fades in.
- Heading slides up while fading in.
- Subtitle appears 150ms later.
- CTA buttons appear last (700-1000ms duration).

### 2. District Cards
- Old card fades out.
- Loading line animates (150ms).
- New card slides upward.
- Numbers count up sequentially.

### 3. Map Interactions
- Hovering districts: fill color gradually changes, border thickens slightly, tooltip scales from 0.95 to 1, and selected district pulses once.
- Clicking: camera zooms smoothly, sidebar updates, and charts animate.

### 4. Statistics Counting
- Animate numeric data (e.g., project counts) counting up from 0 to target over ~1 second.

### 5. Timelines
- Line grows vertically, dot appears, title fades in, and description appears.

### 6. Search Bar
- Expanding input smoothly on focus, dropdown fades in, and matching items slide into place.

### 7. Navigation Bar Hover
- Link underline grows from left to right on hover.
- Link text brightens, and icon shifts 2px.

### 8. Tables
- Rows appear sequentially (staggered 40-60ms apart).

### 9. Skeleton Screens
- Avoid raw spinners; prefer shimmer layout skeletons for cards, rows, and maps.

### 10. Progress Bars
- Animate progress bars filling from zero rather than displaying statically.
