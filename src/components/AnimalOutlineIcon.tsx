import React from 'react';

interface AnimalOutlineIconProps extends React.SVGProps<SVGSVGElement> {
  category: string;
  className?: string;
}

export default function AnimalOutlineIcon({ category, className = "h-6 w-6", ...props }: AnimalOutlineIconProps) {
  const normCategory = category.toLowerCase().trim();

  if (normCategory.includes('cow') || normCategory.includes('bull') || normCategory.includes('cattle')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        stroke="currentColor"
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Head shape */}
        <path d="M5 9c0-3 2-5 7-5s7 2 7 5v4c0 3-3 6-7 6s-7-3-7-6V9z" />
        {/* Horns */}
        <path d="M5 8c-2-1.5-3-3-2-4s3 .5 4 2" />
        <path d="M19 8c2-1.5 3-3 2-4s-3 .5-4 2" />
        {/* Ears */}
        <path d="M5 10c-1.5 0-2.5 1-2 2s1.5 1 2.5 0" />
        <path d="M19 10c1.5 0 2.5 1 2 2s-1.5 1-2.5 0" />
        {/* Nose/Muzzle line */}
        <path d="M8 15h8c1 0 1.5 1 1.5 2s-1 2-2.5 2H9c-1.5 0-2.5-1-2.5-2s.5-2 1.5-2z" />
        {/* Nostrils */}
        <circle cx="10" cy="17" r="0.5" fill="currentColor" />
        <circle cx="14" cy="17" r="0.5" fill="currentColor" />
      </svg>
    );
  }

  if (normCategory.includes('ram') || normCategory.includes('sheep')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        stroke="currentColor"
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Face */}
        <path d="M7 9c0-2.5 1.5-4 5-4s5 1.5 5 4v4c0 2-1.5 3-5 3s-5-1-5-3V9z" />
        {/* Curved Horns (extremely characteristic of a Ram) */}
        <path d="M7 8c-2.5-1-4-3-3.5-5s3-1 4.5 2c1 2 .5 4-.5 5" />
        <path d="M17 8c2.5-1 4-3 3.5-5s-3-1-4.5 2c-1 2-.5 4 .5 5" />
        {/* Ears */}
        <path d="M7 10c-1 0-2 .5-2 1.5s1 1.5 2 .5" />
        <path d="M17 10c1 0 2 .5 2 1.5s-1 1.5-2 .5" />
        {/* Nose */}
        <path d="M10 14h4l-2 1.5z" />
      </svg>
    );
  }

  // Default to Goat / Generic
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Long face */}
      <path d="M6 8c0-2 1.5-3 6-3s6 1 6 3v5l-3 4H9l-3-4V8z" />
      {/* Horns */}
      <path d="M8 5c-1-2-1.5-3-1-3.5s2 .5 3 2.5" />
      <path d="M16 5c1-2 1.5-3 1-3.5s-2 .5-3 2.5" />
      {/* Drooping Ears */}
      <path d="M6 9c-1.5 1-2 3-1.5 4s1 .5 1.5-1" />
      <path d="M18 9c1.5 1 2 3 1.5 4s-1 .5-1.5-1" />
      {/* Beard */}
      <path d="M10 18l2 3 2-3" />
      {/* Muzzle */}
      <path d="M10 16h4" />
    </svg>
  );
}
