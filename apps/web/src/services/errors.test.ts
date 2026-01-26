import { describe, it, expect } from 'vitest';
import {
  StellarError,
  NetworkError,
  TransactionError,
  TransactionTimeoutError,
  ContractError,
  SimulationError,
  AccountNotFoundError,
  StreamNotFoundError,
  InsufficientFundsError,
  ValidationError,
  parseError,
} from './errors';

describe('Error Classes', () => {
  describe('StellarError', () => {
    it('should create a base error with code', () => {
      const error = new StellarError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('StellarError');
      expect(error instanceof Error).toBe(true);
    });

    it('should preserve original error', () => {
      const originalError = new Error('Original');
      const error = new StellarError('Wrapped error', 'WRAPPED', originalError);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('NetworkError', () => {
    it('should create network error with correct code', () => {
      const error = new NetworkError('Connection failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
      expect(error instanceof StellarError).toBe(true);
    });
  });

  describe('TransactionError', () => {
    it('should create transaction error with options', () => {
      const error = new TransactionError('Transaction failed', {
        txHash: 'abc123',
        resultCodes: ['op_no_trust', 'op_underfunded'],
      });
      expect(error.code).toBe('TRANSACTION_ERROR');
      expect(error.txHash).toBe('abc123');
      expect(error.resultCodes).toEqual(['op_no_trust', 'op_underfunded']);
    });
  });

  describe('TransactionTimeoutError', () => {
    it('should create timeout error with hash', () => {
      const error = new TransactionTimeoutError('hash123');
      expect(error.txHash).toBe('hash123');
      expect(error.message).toContain('timed out');
      expect(error instanceof TransactionError).toBe(true);
    });
  });

  describe('ContractError', () => {
    it('should include contract details', () => {
      const error = new ContractError('Contract call failed', {
        contractId: 'CONTRACT123',
        method: 'create_stream',
      });
      expect(error.contractId).toBe('CONTRACT123');
      expect(error.method).toBe('create_stream');
    });
  });

  describe('SimulationError', () => {
    it('should include simulation result', () => {
      const simResult = { error: 'insufficient resources' };
      const error = new SimulationError('Simulation failed', simResult);
      expect(error.simulationResult).toBe(simResult);
      expect(error.code).toBe('SIMULATION_ERROR');
    });
  });

  describe('AccountNotFoundError', () => {
    it('should include account ID', () => {
      const accountId = 'GABC123';
      const error = new AccountNotFoundError(accountId);
      expect(error.accountId).toBe(accountId);
      expect(error.message).toContain(accountId);
      expect(error.code).toBe('ACCOUNT_NOT_FOUND');
    });
  });

  describe('StreamNotFoundError', () => {
    it('should include stream ID', () => {
      const streamId = 123n;
      const error = new StreamNotFoundError(streamId);
      expect(error.streamId).toBe(streamId);
      expect(error.message).toContain('123');
      expect(error.code).toBe('STREAM_NOT_FOUND');
    });
  });

  describe('InsufficientFundsError', () => {
    it('should include fund details', () => {
      const error = new InsufficientFundsError('Not enough tokens', {
        required: 1000n,
        available: 500n,
      });
      expect(error.required).toBe(1000n);
      expect(error.available).toBe(500n);
      expect(error.code).toBe('INSUFFICIENT_FUNDS');
    });
  });

  describe('ValidationError', () => {
    it('should include field name', () => {
      const error = new ValidationError('Invalid amount', 'totalAmount');
      expect(error.field).toBe('totalAmount');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });
});

describe('parseError', () => {
  it('should return StellarError as-is', () => {
    const original = new ValidationError('Test', 'field');
    const parsed = parseError(original);
    expect(parsed).toBe(original);
  });

  it('should parse network errors', () => {
    const error = new Error('fetch failed');
    const parsed = parseError(error);
    expect(parsed instanceof NetworkError).toBe(true);
  });

  it('should parse timeout errors', () => {
    const error = new Error('504 Gateway Timeout');
    const parsed = parseError(error);
    expect(parsed instanceof TransactionTimeoutError).toBe(true);
  });

  it('should parse account not found errors', () => {
    const error = new Error('Account not found: GABC123');
    const parsed = parseError(error);
    expect(parsed instanceof AccountNotFoundError).toBe(true);
  });

  it('should parse insufficient funds errors', () => {
    const error = new Error('insufficient balance');
    const parsed = parseError(error);
    expect(parsed instanceof InsufficientFundsError).toBe(true);
  });

  it('should handle unknown errors', () => {
    const error = new Error('Something went wrong');
    const parsed = parseError(error);
    expect(parsed instanceof StellarError).toBe(true);
    expect(parsed.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle null/undefined', () => {
    const parsed = parseError(null);
    expect(parsed instanceof StellarError).toBe(true);
  });
});
