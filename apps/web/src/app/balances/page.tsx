"use client";

import { TokenBalanceList } from "@/components/token-balance";

export default function BalancesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">
            Token Balances
          </h1>
          <p className="text-zinc-400">
            View all your Stellar token balances in one place
          </p>
        </div>

        {/* Token Balance List Component */}
        <TokenBalanceList className="max-w-2xl" />
      </div>
    </div>
  );
}
