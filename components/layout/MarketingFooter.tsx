"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-dark-800 bg-dark-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Image src="/logo.png" alt="SovSeal" width={32} height={32} />
              <span className="gradient-text font-display text-xl font-bold">
                SovSeal
              </span>
            </Link>
            <p className="mb-6 max-w-md text-sm text-dark-400">
              Lock a moment. Unlock a memory. Time-locked messages encrypted in
              your browser and delivered exactly when you decide.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <ShieldCheckIcon className="h-4 w-4 text-brand-500" />
                <span>AES-256-GCM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <LockClosedIcon className="h-4 w-4 text-brand-500" />
                <span>Client-side only</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <CodeBracketIcon className="h-4 w-4 text-brand-500" />
                <span>Open source</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-display font-semibold text-dark-100">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/app"
                  className="text-sm text-dark-400 transition-colors hover:text-brand-400"
                >
                  Launch App
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-dark-400 transition-colors hover:text-brand-400"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-sm text-dark-400 transition-colors hover:text-brand-400"
                >
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-display font-semibold text-dark-100">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/radebe49/sovseal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-dark-400 transition-colors hover:text-brand-400"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/radebe49/sovseal/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-dark-400 transition-colors hover:text-brand-400"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/radebe49/sovseal/blob/main/docs/user-guide.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-dark-400 transition-colors hover:text-brand-400"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-dark-800 pt-8 md:flex-row">
          <p className="text-sm text-dark-500">
            © {currentYear} SovSeal. Apache License 2.0.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://polkadot.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dark-500 transition-colors hover:text-dark-400"
            >
              Built on Polkadot
            </a>
            <a
              href="https://storacha.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dark-500 transition-colors hover:text-dark-400"
            >
              Storage by Storacha
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
