/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  poweredByHeader: false,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for better performance
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: [
      '@heroicons/react',
      'lucide-react',
      '@polkadot/util',
      '@polkadot/util-crypto',
      'ethers',
      '@privy-io/react-auth',
    ],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Stub out unused dependencies from Privy (we only use Ethereum)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Solana - not used
        '@solana-program/system': false,
        '@solana/web3.js': false,
        '@solana/spl-token': false,
        '@solana/wallet-adapter-base': false,
        // Farcaster - not used
        '@farcaster/auth-kit': false,
        // Other unused
        'pino-pretty': false,
      };

      // Alias unused modules to empty
      config.resolve.alias = {
        ...config.resolve.alias,
        // Stub Solana modules
        '@solana-program/system': false,
        '@solana/web3.js': false,
      };
    }

    // Optimize chunks for better caching
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate vendor chunks for better caching
            polkadot: {
              test: /[\\/]node_modules[\\/]@polkadot[\\/]/,
              name: 'polkadot',
              chunks: 'all',
              priority: 30,
            },
            ethers: {
              test: /[\\/]node_modules[\\/]ethers[\\/]/,
              name: 'ethers',
              chunks: 'all',
              priority: 30,
            },
            storacha: {
              test: /[\\/]node_modules[\\/]@storacha[\\/]/,
              name: 'storacha',
              chunks: 'all',
              priority: 30,
            },
            privy: {
              test: /[\\/]node_modules[\\/]@privy-io[\\/]/,
              name: 'privy',
              chunks: 'async', // Load async to not block initial render
              priority: 30,
            },
            ffmpeg: {
              test: /[\\/]node_modules[\\/]@ffmpeg[\\/]/,
              name: 'ffmpeg',
              chunks: 'async', // Load async for lazy loading
              priority: 30,
            },
          },
        },
      };
    }

    return config;
  },

  // Required headers for ffmpeg.wasm (SharedArrayBuffer support) and security (H9)
  async headers() {
    /**
     * Security headers (H9)
     * Protect against XSS, clickjacking, and other attacks
     */
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // Scripts: self + inline for Next.js hydration + eval for certain libs
          "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
          // Styles: self + inline for CSS-in-JS + Google Fonts
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          // Fonts: self + Google Fonts
          "font-src 'self' https://fonts.gstatic.com data:",
          // Images: self + data/blob URIs + HTTPS sources
          "img-src 'self' data: blob: https:",
          // Media: self + blob URIs (for decrypted media playback)
          "media-src 'self' blob:",
          // Connect: self + RPC endpoints + IPFS gateways + wallet connections
          "connect-src 'self' https://testnet-passet-hub-eth-rpc.polkadot.io https://polkadot-asset-hub-eth-rpc.polkadot.io https://asset-hub-polkadot.api.onfinality.io https://*.ipfs.storacha.link https://*.ipfs.w3s.link https://*.ipfs.dweb.link wss://relay.walletconnect.org wss://relay.walletconnect.com",
          // Workers: self + blob for web workers
          "worker-src 'self' blob:",
          // Frame ancestors: none (prevent clickjacking)
          "frame-ancestors 'none'",
          // Base URI: self
          "base-uri 'self'",
          // Form action: self
          "form-action 'self'",
          // Object: none (no plugins)
          "object-src 'none'",
        ].join('; ')
      },
      {
        // Prevent clickjacking
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        // Prevent MIME-sniffing attacks
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        // Control referrer information
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        // Control browser features
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(self), geolocation=(), payment=()'
      },
      {
        // Enable XSS filter (legacy browsers)
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
    ];

    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers (H9)
          ...securityHeaders,
          // Required for ffmpeg.wasm SharedArrayBuffer support
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
