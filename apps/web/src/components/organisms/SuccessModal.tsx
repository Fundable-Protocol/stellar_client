'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessModalProps {
  isOpen: boolean;
  transactionHash: string;
  onClose: () => void;
  onReset: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  transactionHash,
  onClose,
  onReset,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Distribution Successful</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-zinc-300">
            Your token distribution has been successfully submitted to the Stellar network.
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Transaction Hash:</span>
              <span className="text-zinc-100 font-mono text-xs break-all">{transactionHash}</span>
            </div>
          </div>

          <div className="text-xs text-zinc-500">
            You can view the transaction details on the Stellar explorer.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            onClick={onReset}
          >
            Distribute More
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
