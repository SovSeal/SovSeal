"use client";

/**
 * VaultBackground - Subtle obsidian atmosphere effect
 *
 * Creates a cold, institutional vault-like background
 * with subtle metallic gold and slate grey undertones
 */
export function AuroraBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base obsidian gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />

      {/* Subtle gold accent layer - very muted */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(197, 160, 89, 0.08), transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(100, 116, 139, 0.05), transparent 50%)
          `,
          animation: "vault-ambient 30s ease-in-out infinite",
        }}
      />

      {/* Secondary slate layer for depth */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 70% 60%, rgba(100, 116, 139, 0.06), transparent 50%),
            radial-gradient(ellipse 70% 50% at 30% 30%, rgba(197, 160, 89, 0.04), transparent 50%)
          `,
          animation: "vault-ambient 40s ease-in-out infinite reverse",
        }}
      />

      {/* Subtle noise texture overlay for metallic feel */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />

      <style jsx>{`
        @keyframes vault-ambient {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.15;
          }
          50% {
            transform: translate(1%, -1%) scale(1.01);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}

