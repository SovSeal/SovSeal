/**
 * Toast - Toast notification component
 *
 * Requirements: 11.3
 */

"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      icon: "✓",
      iconBg: "bg-green-500",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: "✕",
      iconBg: "bg-red-500",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-800",
      icon: "⚠",
      iconBg: "bg-yellow-500",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      icon: "ℹ",
      iconBg: "bg-blue-500",
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`${style.bg} ${style.text} border rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      role="alert"
    >
      <div
        className={`${style.iconBg} text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold`}
      >
        {style.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
}
