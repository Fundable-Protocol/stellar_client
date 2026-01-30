/**
 * DistributionTypeSelector - Radio button group for selecting distribution type
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { DistributionType } from '@/types/distribution';

interface DistributionTypeSelectorProps {
  /** Current selected distribution type */
  value: DistributionType;
  /** Callback when distribution type changes */
  onChange: (type: DistributionType) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Radio button group for selecting between equal and weighted distribution
 */
export function DistributionTypeSelector({
  value,
  onChange,
  disabled = false,
  className,
}: DistributionTypeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-200">
          Distribution Type
        </label>
        
        <div className="space-y-3">
          {/* Equal Distribution Option */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="distribution-equal"
                name="distribution-type"
                type="radio"
                value="equal"
                checked={value === 'equal'}
                onChange={(e) => onChange(e.target.value as DistributionType)}
                disabled={disabled}
                className={cn(
                  'h-4 w-4 border-zinc-600 bg-zinc-800 text-zinc-400 focus:ring-zinc-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="distribution-equal"
                className={cn(
                  'block text-sm font-medium text-zinc-200 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                Equal Distribution
              </label>
              <p className={cn(
                'text-sm text-zinc-400 mt-1',
                disabled && 'opacity-50'
              )}>
                Split the total amount equally among all recipients
              </p>
            </div>
          </div>

          {/* Weighted Distribution Option */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="distribution-weighted"
                name="distribution-type"
                type="radio"
                value="weighted"
                checked={value === 'weighted'}
                onChange={(e) => onChange(e.target.value as DistributionType)}
                disabled={disabled}
                className={cn(
                  'h-4 w-4 border-zinc-600 bg-zinc-800 text-zinc-400 focus:ring-zinc-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="distribution-weighted"
                className={cn(
                  'block text-sm font-medium text-zinc-200 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                Weighted Distribution
              </label>
              <p className={cn(
                'text-sm text-zinc-400 mt-1',
                disabled && 'opacity-50'
              )}>
                Specify individual amounts for each recipient
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}