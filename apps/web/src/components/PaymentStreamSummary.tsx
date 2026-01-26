import { PaymentStreamFormData, SUPPORTED_TOKENS } from "@/lib/validations"

interface PaymentStreamSummaryProps {
  data: PaymentStreamFormData
}

export function PaymentStreamSummary({ data }: PaymentStreamSummaryProps) {
  const selectedToken = SUPPORTED_TOKENS.find(token => token.value === data.token)

  // Parse and validate duration to avoid division by zero
  const parsedDuration = parseFloat(data.duration)
  const durationInHours = data.durationUnit === "days"
    ? (Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration * 24 : 1)
    : (Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 1)

  // Parse and validate amount to avoid NaN propagation
  const totalAmount = parseFloat(data.totalAmount)
  const validAmount = Number.isFinite(totalAmount) ? totalAmount : 0

  const amountPerHour = validAmount / durationInHours
  const amountPerDay = amountPerHour * 24

  return (
    <div className="space-y-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
      <h3 className="font-semibold text-lg text-zinc-50">Stream Summary</h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-zinc-400">Recipient:</span>
          <p className="font-mono text-xs break-all text-zinc-50">{data.recipientAddress}</p>
        </div>

        <div>
          <span className="text-zinc-400">Token:</span>
          <p className="font-medium text-zinc-50">{selectedToken?.label || data.token}</p>
        </div>

        <div>
          <span className="text-zinc-400">Total Amount:</span>
          <p className="font-medium text-zinc-50">{data.totalAmount} {data.token}</p>
        </div>

        <div>
          <span className="text-zinc-400">Duration:</span>
          <p className="font-medium text-zinc-50">{data.duration} {data.durationUnit}</p>
        </div>

        <div>
          <span className="text-zinc-400">Rate per Hour:</span>
          <p className="font-medium text-zinc-50">{amountPerHour.toFixed(7)} {data.token}</p>
        </div>

        <div>
          <span className="text-zinc-400">Rate per Day:</span>
          <p className="font-medium text-zinc-50">{amountPerDay.toFixed(7)} {data.token}</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Cancelable:</span>
          <span className={`px-2 py-1 rounded text-xs ${data.cancelable
              ? "bg-green-900/30 text-green-400 border border-green-800"
              : "bg-red-900/30 text-red-400 border border-red-800"
            }`}>
            {data.cancelable ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Transferable:</span>
          <span className={`px-2 py-1 rounded text-xs ${data.transferable
              ? "bg-green-900/30 text-green-400 border border-green-800"
              : "bg-red-900/30 text-red-400 border border-red-800"
            }`}>
            {data.transferable ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  )
}