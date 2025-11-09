/**
 * Logo - FutureProof logo component
 *
 * Requirements: 11.1
 */

"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function Logo({ size = "md", showIcon = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-5xl",
  };

  const iconSizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center space-x-2">
      {showIcon && (
        <div
          className={`${iconSizeClasses[size]} flex items-center justify-center`}
        >
          {/* Lock with clock icon - represents time-locked messages */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <defs>
              <linearGradient
                id="logoGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            {/* Lock body */}
            <rect
              x="5"
              y="11"
              width="14"
              height="10"
              rx="2"
              stroke="url(#logoGradient)"
              strokeWidth="2"
              fill="none"
            />
            {/* Lock shackle */}
            <path
              d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
              stroke="url(#logoGradient)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Clock hands inside lock */}
            <line
              x1="12"
              y1="16"
              x2="12"
              y2="14"
              stroke="url(#logoGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="16"
              x2="13.5"
              y2="16"
              stroke="url(#logoGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <span
        className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent`}
      >
        FutureProof
      </span>
    </div>
  );
}
