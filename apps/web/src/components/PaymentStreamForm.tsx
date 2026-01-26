"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PaymentStreamConfirmationModal } from "./PaymentStreamConfirmationModal"
import { paymentStreamSchema, type PaymentStreamFormData, SUPPORTED_TOKENS } from "@/lib/validations"
import { StellarService } from "@/lib/stellar"

interface PaymentStreamFormProps {
  onSuccess?: (streamId: string) => void
  onError?: (error: string) => void
}

export function PaymentStreamForm({ onSuccess, onError }: PaymentStreamFormProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<PaymentStreamFormData>({
    resolver: zodResolver(paymentStreamSchema),
    defaultValues: {
      durationUnit: "days",
      cancelable: true,
      transferable: false,
    },
  })

  const watchedValues = watch()

  const onSubmit = (data: PaymentStreamFormData) => {
    setShowConfirmation(true)
  }

  const handleConfirm = async (data: PaymentStreamFormData) => {
    setIsSubmitting(true)
    try {
      const streamId = await StellarService.createPaymentStream(data)
      onSuccess?.(streamId)
      setShowConfirmation(false)
      reset() // Reset form after successful submission
    } catch (error) {
      console.error("Error creating payment stream:", error)
      onError?.(error instanceof Error ? error.message : "Failed to create payment stream")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recipientAddress">Recipient Address</Label>
          <Input
            id="recipientAddress"
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            {...register("recipientAddress")}
          />
          <p className="text-xs text-zinc-400">
            Example: GCKFBEIYTKP5RDBQMTVVALONAOPBXICYQPGJGQONRRGZRWCXJWW2BVN7
          </p>
          {errors.recipientAddress && (
            <p className="text-sm text-red-400">{errors.recipientAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Select
            id="token"
            {...register("token")}
          >
            <option value="">Select a token</option>
            {SUPPORTED_TOKENS.map((token) => (
              <option key={token.value} value={token.value}>
                {token.label}
              </option>
            ))}
          </Select>
          {errors.token && (
            <p className="text-sm text-red-400">{errors.token.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            type="number"
            step="0.0000001"
            placeholder="0.00"
            {...register("totalAmount")}
          />
          {errors.totalAmount && (
            <p className="text-sm text-red-400">{errors.totalAmount.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="1"
              {...register("duration")}
            />
            {errors.duration && (
              <p className="text-sm text-red-400">{errors.duration.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationUnit">Unit</Label>
            <Select
              id="durationUnit"
              {...register("durationUnit")}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </Select>
            {errors.durationUnit && (
              <p className="text-sm text-red-400">{errors.durationUnit.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cancelable">Cancelable</Label>
              <p className="text-sm text-zinc-400">Allow sender to cancel the stream</p>
            </div>
            <Switch
              id="cancelable"
              {...register("cancelable")}
              onChange={(e) => setValue("cancelable", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="transferable">Transferable</Label>
              <p className="text-sm text-zinc-400">Allow recipient to transfer the stream</p>
            </div>
            <Switch
              id="transferable"
              {...register("transferable")}
              onChange={(e) => setValue("transferable", e.target.checked)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create Payment Stream
        </Button>
      </form>

      <PaymentStreamConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        data={getValues()}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </>
  )
}