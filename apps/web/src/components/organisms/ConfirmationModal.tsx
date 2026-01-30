'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TransactionSummary } from '@/types/distribution';

interface ConfirmationModalProps {
  isOpen: boolean;
  summary: TransactionSummary;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  summary,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Distribution</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-zinc-300">
            Please review the distribution details before confirming:
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Type:</span>
              <span className="text-zinc-100 capitalize">{summary.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Recipients:</span>
              <span className="text-zinc-100">{summary.recipientCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Amount:</span>
              <span className="text-zinc-100">{summary.totalAmount} {summary.tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Estimated Fee:</span>
              <span className="text-zinc-100">{summary.estimatedFee} XLM</span>
            </div>
          </div>

          <div className="text-xs text-zinc-500">
            This action cannot be undone. Please ensure all details are correct.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm Distribution'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
