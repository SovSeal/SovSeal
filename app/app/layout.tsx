import { WalletProvider } from "@/lib/wallet/WalletProvider";
import { Navigation, Footer } from "@/components/layout";
import { ToastProvider, SkipToContent } from "@/components/ui";
import { NetworkWarning } from "@/components/wallet/NetworkWarning";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <ToastProvider>
        <WalletProvider>
          <NetworkWarning />
          <Navigation />
          <main id="main-content" className="flex-1 bg-dark-950">
            {children}
          </main>
          <Footer />
        </WalletProvider>
      </ToastProvider>
    </div>
  );
}
