/**
 * HelpText - Help text component for providing guidance
 */

"use client";

interface HelpTextProps {
  children: React.ReactNode;
  type?: "info" | "warning" | "success";
}

export function HelpText({ children, type = "info" }: HelpTextProps) {
  const typeStyles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "⚠",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "✓",
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`${style.bg} ${style.border} ${style.text} flex items-start gap-2 rounded-lg border p-3 text-sm`}
      role="note"
    >
      <span className="flex-shrink-0 font-bold">{style.icon}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
