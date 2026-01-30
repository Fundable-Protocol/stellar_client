'use client';

import { useState, useCallback } from 'react';
import { DistributionState, TransactionSummary } from '@/types/distribution';
import { StellarService } from '@/services/stellar.service';

interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

interface UseDistributionTransactionReturn {
  isLoading: boolean;
  error: string | null;
  executeTransaction: (state: DistributionState) => Promise<TransactionResult>;
  prepareSummary: (state: DistributionState) => TransactionSummary;
  reset: () => void;
}

export function useDistributionTransaction(
  stellarService: StellarService,
  senderAddress: string,
  tokenAddress: string = 'native' // Default to XLM
): UseDistributionTransactionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prepareSummary = useCallback((state: DistributionState): TransactionSummary => {
    const totalAmount = state.type === 'equal' 
      ? state.totalAmount
      : state.recipients.reduce((sum, recipient) => {
          return sum + (parseFloat(recipient.amount || '0'));
        }, 0).toString();

    return {
      type: state.type,
      recipientCount: state.recipients.length,
      totalAmount,
      tokenSymbol: tokenAddress === 'native' ? 'XLM' : 'TOKEN',
      estimatedFee: '0.00001', // Base fee for Stellar transaction
    };
  }, [tokenAddress]);

  const executeTransaction = useCallback(async (
    state: DistributionState
  ): Promise<TransactionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate state before execution
      if (state.recipients.length === 0) {
        throw new Error('No recipients provided');
      }

      if (state.type === 'equal' && !state.totalAmount) {
        throw new Error('Total amount is required for equal distribution');
      }

      if (state.type === 'weighted') {
        const hasInvalidAmounts = state.recipients.some(r => !r.amount || parseFloat(r.amount) <= 0);
        if (hasInvalidAmounts) {
          throw new Error('All recipients must have valid amounts for weighted distribution');
        }
      }

      const recipients = state.recipients.map(r => r.address);
      
      let transactionHash: string;

      if (state.type === 'equal') {
        // Convert total amount to stroops (1 XLM = 10^7 stroops)
        const totalAmountStroops = Math.floor(parseFloat(state.totalAmount) * 10000000);
        
        transactionHash = await stellarService.distributeEqual(
          senderAddress,
          tokenAddress,
          totalAmountStroops.toString(),
          recipients
        );
      } else {
        // Weighted distribution
        const amounts = state.recipients.map(r => {
          const amountStroops = Math.floor(parseFloat(r.amount!) * 10000000);
          return amountStroops.toString();
        });

        transactionHash = await stellarService.distributeWeighted(
          senderAddress,
          tokenAddress,
          recipients,
          amounts
        );
      }

      return {
        success: true,
        transactionHash,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [stellarService, senderAddress, tokenAddress]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    executeTransaction,
    prepareSummary,
    reset,
  };
}