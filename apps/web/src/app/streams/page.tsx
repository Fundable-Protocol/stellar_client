"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WithdrawStreamModal } from "@/components/WithdrawStreamModal"
import { StreamRecord } from "@/lib/validations"
import { StellarService } from "@/lib/stellar"

export default function StreamsPage() {
  const [streams, setStreams] = useState<StreamRecord[]>([])
  const [selectedStream, setSelectedStream] = useState<StreamRecord | null>(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mock streams data - in reality this would come from the blockchain
  useEffect(() => {
    const mockStreams: StreamRecord[] = [
      {
        id: "stream_1704067200_abc123",
        sender: "GCKFBEIYTKP5RDBQMTVVALONAOPBXICYQPGJGQONRRGZRWCXJWW2BVN7",
        recipient: "GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7",
        token: "USDC",
        tokenSymbol: "USDC",
        totalAmount: "1000.0000000",
        withdrawnAmount: "250.0000000",
        startTime: Date.now() - 86400000, // Started 1 day ago
        endTime: Date.now() + 86400000 * 6, // Ends in 6 days
        status: "Active",
        cancelable: true,
        transferable: false,
      },
      {
        id: "stream_1704067300_def456",
        sender: "GCKFBEIYTKP5RDBQMTVVALONAOPBXICYQPGJGQONRRGZRWCXJWW2BVN7",
        recipient: "GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH2BEWFG4BRUY4CKI7",
        token: "XLM",
        tokenSymbol: "XLM",
        totalAmount: "5000.0000000",
        withdrawnAmount: "1200.0000000",
        startTime: Date.now() - 172800000, // Started 2 days ago
        endTime: Date.now() + 86400000 * 5, // Ends in 5 days
        status: "Active",
        cancelable: false,
        transferable: true,
      },
    ]
    setStreams(mockStreams)
  }, [])

  const handleWithdraw = (stream: StreamRecord) => {
    setSelectedStream(stream)
    setShowWithdrawModal(true)
  }

  const handleWithdrawSuccess = (txHash: string) => {
    setSuccessMessage(`Withdrawal successful! Transaction: ${txHash}`)
    setErrorMessage(null)
    // In a real app, you would refresh the stream data here
  }

  const handleWithdrawError = (error: string) => {
    setErrorMessage(error)
    setSuccessMessage(null)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-zinc-50 flex items-center gap-2"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-800 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-zinc-50 mb-2">
                Payment Streams
              </h1>
              <p className="text-zinc-400">
                Manage your active payment streams
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <p className="text-green-400">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              {streams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">No payment streams found</p>
                  <Link href="/create-stream">
                    <Button>Create Your First Stream</Button>
                  </Link>
                </div>
              ) : (
                streams.map((stream) => {
                  const progress = StellarService.calculateStreamProgress(stream)
                  // Calculate vested amount based on progress percentage
                  const vested = (progress.progressPercentage / 100) * parseFloat(stream.totalAmount)
                  const available = Math.max(0, vested - parseFloat(stream.withdrawnAmount))

                  return (
                    <div key={stream.id} className="border border-zinc-800 rounded-lg p-6 space-y-4 bg-zinc-800/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-zinc-50">
                            {StellarService.formatTokenAmount(stream.totalAmount)} {stream.tokenSymbol} Stream
                          </h3>
                          <p className="text-sm text-zinc-400 font-mono">
                            ID: {stream.id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${stream.status === "Active"
                              ? "bg-green-900/30 text-green-400 border border-green-800"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}>
                            {stream.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-400">Total:</span>
                          <p className="font-medium text-zinc-50">{StellarService.formatTokenAmount(stream.totalAmount)} {stream.tokenSymbol}</p>
                        </div>
                        <div>
                          <span className="text-zinc-400">Withdrawn:</span>
                          <p className="font-medium text-zinc-50">{StellarService.formatTokenAmount(stream.withdrawnAmount)} {stream.tokenSymbol}</p>
                        </div>
                        <div>
                          <span className="text-zinc-400">Available:</span>
                          <p className="font-medium text-green-400">{available.toFixed(7)} {stream.tokenSymbol}</p>
                        </div>
                        <div>
                          <span className="text-zinc-400">Progress:</span>
                          <p className="font-medium text-zinc-50">{progress.progressPercentage.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progressPercentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-zinc-400">
                          <p>Rate: {progress.ratePerHour.toFixed(4)} {stream.tokenSymbol}/hour</p>
                          <p>Time remaining: {progress.timeRemaining}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdraw(stream)}
                            disabled={stream.status !== "Active" || available <= 0}
                            className="border-zinc-700 text-zinc-50 hover:bg-zinc-800"
                          >
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedStream && (
        <WithdrawStreamModal
          open={showWithdrawModal}
          onOpenChange={setShowWithdrawModal}
          stream={selectedStream}
          onSuccess={handleWithdrawSuccess}
          onError={handleWithdrawError}
        />
      )}
    </div>
  )
}