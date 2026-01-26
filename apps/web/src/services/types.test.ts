import { describe, it, expect } from 'vitest';
import type {
  Stream,
  StreamStatus,
  CreateStreamParams,
  DistributeParams,
  DistributeEqualParams,
  TransactionResult,
  AccountInfo,
  AccountBalance,
  NetworkConfig,
  ContractAddresses,
  StellarServiceConfig,
} from './types';

describe('Type Definitions', () => {
  describe('Stream', () => {
    it('should have correct structure', () => {
      const stream: Stream = {
        id: 1n,
        sender: 'GABC123',
        recipient: 'GDEF456',
        token: 'CTOKEN',
        totalAmount: 1000n,
        withdrawnAmount: 500n,
        startTime: 1000n,
        endTime: 2000n,
        status: 'Active',
      };

      expect(stream.id).toBe(1n);
      expect(stream.sender).toBe('GABC123');
      expect(stream.recipient).toBe('GDEF456');
      expect(stream.token).toBe('CTOKEN');
      expect(stream.totalAmount).toBe(1000n);
      expect(stream.withdrawnAmount).toBe(500n);
      expect(stream.startTime).toBe(1000n);
      expect(stream.endTime).toBe(2000n);
      expect(stream.status).toBe('Active');
    });

    it('should support all stream statuses', () => {
      const statuses: StreamStatus[] = ['Active', 'Paused', 'Canceled', 'Completed'];
      expect(statuses).toHaveLength(4);
    });
  });

  describe('CreateStreamParams', () => {
    it('should have correct structure', () => {
      const params: CreateStreamParams = {
        recipient: 'GDEF456',
        token: 'CTOKEN',
        totalAmount: 1000n,
        startTime: 1000n,
        endTime: 2000n,
      };

      expect(params.recipient).toBe('GDEF456');
      expect(params.token).toBe('CTOKEN');
      expect(params.totalAmount).toBe(1000n);
      expect(params.startTime).toBe(1000n);
      expect(params.endTime).toBe(2000n);
    });
  });

  describe('DistributeParams', () => {
    it('should have correct structure', () => {
      const params: DistributeParams = {
        recipients: ['GABC', 'GDEF'],
        amounts: [500n, 500n],
        token: 'CTOKEN',
      };

      expect(params.recipients).toHaveLength(2);
      expect(params.amounts).toHaveLength(2);
      expect(params.token).toBe('CTOKEN');
    });
  });

  describe('DistributeEqualParams', () => {
    it('should have correct structure', () => {
      const params: DistributeEqualParams = {
        recipients: ['GABC', 'GDEF', 'GHIJ'],
        totalAmount: 1500n,
        token: 'CTOKEN',
      };

      expect(params.recipients).toHaveLength(3);
      expect(params.totalAmount).toBe(1500n);
      expect(params.token).toBe('CTOKEN');
    });
  });

  describe('TransactionResult', () => {
    it('should have correct structure for success', () => {
      const result: TransactionResult<bigint> = {
        hash: 'abc123',
        success: true,
        result: 42n,
        ledger: 12345,
      };

      expect(result.hash).toBe('abc123');
      expect(result.success).toBe(true);
      expect(result.result).toBe(42n);
      expect(result.ledger).toBe(12345);
    });

    it('should have correct structure for failure', () => {
      const result: TransactionResult = {
        hash: 'abc123',
        success: false,
      };

      expect(result.hash).toBe('abc123');
      expect(result.success).toBe(false);
      expect(result.result).toBeUndefined();
      expect(result.ledger).toBeUndefined();
    });
  });

  describe('AccountInfo', () => {
    it('should have correct structure', () => {
      const info: AccountInfo = {
        accountId: 'GABC123',
        sequence: '12345',
        balances: [
          {
            balance: '100.0000000',
            assetType: 'native',
          },
          {
            balance: '500.00',
            assetType: 'credit_alphanum4',
            assetCode: 'USDC',
            assetIssuer: 'GISSUER',
          },
        ],
      };

      expect(info.accountId).toBe('GABC123');
      expect(info.sequence).toBe('12345');
      expect(info.balances).toHaveLength(2);
    });
  });

  describe('AccountBalance', () => {
    it('should support native asset', () => {
      const balance: AccountBalance = {
        balance: '100.0000000',
        assetType: 'native',
      };

      expect(balance.balance).toBe('100.0000000');
      expect(balance.assetType).toBe('native');
      expect(balance.assetCode).toBeUndefined();
      expect(balance.assetIssuer).toBeUndefined();
    });

    it('should support issued assets', () => {
      const balance: AccountBalance = {
        balance: '500.00',
        assetType: 'credit_alphanum4',
        assetCode: 'USDC',
        assetIssuer: 'GISSUER',
      };

      expect(balance.assetCode).toBe('USDC');
      expect(balance.assetIssuer).toBe('GISSUER');
    });
  });

  describe('NetworkConfig', () => {
    it('should have correct structure', () => {
      const config: NetworkConfig = {
        networkPassphrase: 'Test SDF Network ; September 2015',
        rpcUrl: 'https://soroban-testnet.stellar.org',
        horizonUrl: 'https://horizon-testnet.stellar.org',
      };

      expect(config.networkPassphrase).toContain('Test');
      expect(config.rpcUrl).toContain('soroban');
      expect(config.horizonUrl).toContain('horizon');
    });
  });

  describe('ContractAddresses', () => {
    it('should have correct structure', () => {
      const contracts: ContractAddresses = {
        paymentStream: 'CSTREAM',
        distributor: 'CDIST',
      };

      expect(contracts.paymentStream).toBe('CSTREAM');
      expect(contracts.distributor).toBe('CDIST');
    });
  });

  describe('StellarServiceConfig', () => {
    it('should have required fields', () => {
      const config: StellarServiceConfig = {
        network: {
          networkPassphrase: 'Test SDF Network ; September 2015',
          rpcUrl: 'https://soroban-testnet.stellar.org',
          horizonUrl: 'https://horizon-testnet.stellar.org',
        },
        contracts: {
          paymentStream: 'CSTREAM',
          distributor: 'CDIST',
        },
      };

      expect(config.network).toBeDefined();
      expect(config.contracts).toBeDefined();
      expect(config.defaultTimeout).toBeUndefined();
      expect(config.maxRetries).toBeUndefined();
    });

    it('should support optional fields', () => {
      const config: StellarServiceConfig = {
        network: {
          networkPassphrase: 'Test SDF Network ; September 2015',
          rpcUrl: 'https://soroban-testnet.stellar.org',
          horizonUrl: 'https://horizon-testnet.stellar.org',
        },
        contracts: {
          paymentStream: 'CSTREAM',
          distributor: 'CDIST',
        },
        defaultTimeout: 60,
        maxRetries: 5,
      };

      expect(config.defaultTimeout).toBe(60);
      expect(config.maxRetries).toBe(5);
    });
  });
});
