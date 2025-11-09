import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet/WalletProvider";
import { Navigation, Footer } from "@/components/layout";
import { DemoModeBanner } from "@/components/unlock";
import { ToastProvider, SkipToContent } from "@/components/ui";

export const metadata: Metadata = {
  title: "FutureProof - Guaranteed by math, not corporations",
  description: "Decentralized time-capsule application for time-locked messages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 flex flex-col min-h-screen">
        <SkipToContent />
        <ToastProvider>
          <WalletProvider>
            {isDemoMode && <DemoModeBanner />}
            <Navigation />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </WalletProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
