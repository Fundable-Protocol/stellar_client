"use client"

import { useState } from "react"
import Link from "next/link"
import { PaymentStreamForm } from "@/components/PaymentStreamForm"

export default function CreateStreamPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSuccess = (streamId: string) => {
    setSuccessMessage(`Payment stream created successfully! Stream ID: ${streamId}`)
    setErrorMessage(null)
  }

  const handleError = (error: string) => {
    setErrorMessage(error)
    setSuccessMessage(null)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
                Create Payment Stream
              </h1>
              <p className="text-zinc-400">
                Set up a continuous payment stream on the Stellar network
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <p className="text-green-400 mb-3">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-sm text-green-300 hover:text-green-100 underline"
                >
                  Create Another Stream
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400">{errorMessage}</p>
              </div>
            )}

            <PaymentStreamForm
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>
      </div>
    </div>
  )
}