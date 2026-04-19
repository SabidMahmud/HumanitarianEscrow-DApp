import Link from "next/link";
import { WalletMinimal, ExternalLink } from "lucide-react";

interface NoWalletProps {
  /** true = MetaMask not installed, false = installed but not connected */
  notInstalled?: boolean;
  onConnect?: () => void;
}

export default function NoWallet({ notInstalled = false, onConnect }: NoWalletProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-6">
          <WalletMinimal className="w-8 h-8 text-amber-300" />
        </div>

        {notInstalled ? (
          <>
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">MetaMask Required</h2>
            <p className="text-slate-400 text-sm mb-8">
              This dashboard interacts directly with the blockchain. Install MetaMask to continue.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-6 py-3 text-sm font-semibold text-amber-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Install MetaMask
            </a>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">Wallet Not Connected</h2>
            <p className="text-slate-400 text-sm mb-8">
              Connect your wallet to access this dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onConnect ? (
                <button
                  onClick={onConnect}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors cursor-pointer"
                >
                  <WalletMinimal className="w-4 h-4" />
                  Connect Wallet
                </button>
              ) : (
                <Link
                  href="/connect"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors"
                >
                  <WalletMinimal className="w-4 h-4" />
                  Connect Wallet
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
