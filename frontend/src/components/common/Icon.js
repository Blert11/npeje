/**
 * Icon library — replaces all emojis with clean SVG icons.
 * Zero dependencies. Use via <Icon name="hotel" size={20} />.
 *
 * All icons from Lucide (MIT licensed), inlined for performance.
 */
import React from 'react';

const paths = {
  // Categories
  hotels: (
    <>
      <path d="M2 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4"/>
      <path d="M6 8H4"/>
      <path d="M6 16H4"/>
      <path d="M10 12H8"/>
      <path d="M10 8H8"/>
      <path d="M10 16H8"/>
      <path d="M14 22H22V10l-8-4"/>
      <path d="M18 14h.01"/>
      <path d="M18 18h.01"/>
    </>
  ),
  restaurants: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </>
  ),
  fast_food: (
    <>
      <path d="M12 6V2H8"/>
      <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8Z"/>
      <path d="M2 12h2"/>
      <path d="M9 11v2"/>
      <path d="M15 11v2"/>
      <path d="M20 12h2"/>
    </>
  ),
  cafes: (
    <>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" x2="6" y1="2" y2="4"/>
      <line x1="10" x2="10" y1="2" y2="4"/>
      <line x1="14" x2="14" y1="2" y2="4"/>
    </>
  ),
  villas: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </>
  ),
  activities: (
    <>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
    </>
  ),
  nightlife: (
    <>
      <path d="M12 3v12"/>
      <path d="m8 11 4 4 4-4"/>
      <path d="M8 5h8"/>
      <path d="M6 21h12"/>
      <path d="M12 15v6"/>
    </>
  ),
  transport: (
    <>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
      <circle cx="6.5" cy="16.5" r="2.5"/>
      <circle cx="16.5" cy="16.5" r="2.5"/>
    </>
  ),
  shops: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
      <line x1="3" x2="21" y1="6" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </>
  ),

  // UI actions
  search:   <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
  phone:    <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  mail:     <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></>,
  globe:    <><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></>,
  instagram:<><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></>,
  map_pin:  <><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></>,
  map:      <><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></>,
  menu_book:<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/></>,
  user:     <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  grid:     <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  close:    <><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></>,
  chevron_left:  <><path d="m15 18-6-6 6-6"/></>,
  chevron_right: <><path d="m9 18 6-6-6-6"/></>,
  chevron_down:  <><path d="m6 9 6 6 6-6"/></>,
  arrow_right:   <><path d="M5 12h14M12 5l7 7-7 7"/></>,
  expand:        <><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></>,
  star:          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  sparkles:      <><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>,
  zap:           <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  upload:        <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></>,
  image:         <><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  calendar:      <><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></>,
  clock:         <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  check:         <polyline points="20 6 9 17 4 12"/>,
  compass:       <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
  mountain:      <><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></>,
  coffee:        <><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></>,
  bed:           <><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></>,
  whatsapp:      <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>,
  info:          <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  heart:         <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>,
  filter:        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
};

export default function Icon({ name, size = 20, strokeWidth = 2, className = '', style }) {
  const path = paths[name];
  if (!path) return null;
  const isFilled = ['star'].includes(name);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon icon-${name} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
