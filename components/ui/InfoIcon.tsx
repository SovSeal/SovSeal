/**
 * InfoIcon - Information icon with tooltip
 */

"use client";

import { Tooltip } from "./Tooltip";

interface InfoIconProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function InfoIcon({ content, position = "top" }: InfoIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <button
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="More information"
        type="button"
      >
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  );
}
