"use client";

import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
}

export function Logo({
  size = "md",
  showIcon = true,
  showText = true,
}: LogoProps) {
  const iconSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 64, height: 64 },
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <Image
          src="/logo.png"
          alt="SovSeal logo"
          width={iconSizes[size].width}
          height={iconSizes[size].height}
          className="object-contain"
          priority
        />
      )}
      {showText && (
        <span
          className={`${textSizes[size]} gradient-text font-display font-bold`}
        >
          SovSeal
        </span>
      )}
    </div>
  );
}
