/**
 * SkipToContent - Accessibility component for keyboard navigation
 */

"use client";

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
