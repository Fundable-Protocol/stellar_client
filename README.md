# Fundable Stellar

Stellar client and smart contracts for the Fundable Protocol – a decentralized payment platform enabling seamless Web3 payments, streaming, and subscriptions on the Stellar blockchain.

## 🏗️ Project Structure

```
stellar_client/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── src/
│       ├── package.json
│       └── ...
│
├── contracts/               # Soroban smart contracts (Rust)
│   ├── payment-stream/      # Payment streaming contract
│   ├── distributor/         # Token distribution contract
│   └── Cargo.toml           # Rust workspace config
│
├── docs/                      # Project documentation
│   ├── architecture.md
│   ├── getting-started.md     # Project setup documentation
│   ├── contracts/             # Contracts documentation
│   │   ├── distributor.md
│   │   └── payment-stream.md
│   └── frontend/              # Frontend documentation
│       └── components.md
├── packages/                  # Monorepo packages
│   └── sdk/                   # TypeScript SDK for contract interaction
│
└── package.json             # Root workspace config


```

## 🌟 Features

- **Payment Streaming** - Create and manage continuous token streams
- **Token Distribution** - Efficiently distribute tokens to multiple recipients
- **Multi-Asset Support** - USDC, XLM, and other Stellar assets
- **Offramp Integration** - Convert crypto to fiat currencies

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Contracts** | Soroban SDK, Rust |
| **SDK** | TypeScript, @stellar/stellar-sdk |

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- pnpm v8+
- Rust (for contracts)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)

### Installation

```bash
# Clone the repository
git clone git@github.com:Fundable-Protocol/stellar_client.git
cd stellar_client

# Install frontend dependencies
pnpm install

# Build contracts
cd contracts && cargo build --release
```

### Development

```bash
# Start the web app
pnpm dev

# Build contracts
pnpm build:contracts

# Run contract tests
pnpm test:contracts
```

## 📦 Packages

### `apps/web`
Next.js frontend application for interacting with Fundable on Stellar.

### `contracts/payment-stream`
Soroban contract for creating and managing payment streams with:
- Stream creation with linear vesting
- Withdraw, pause, resume, cancel functionality
- Multi-token support

### `contracts/distributor`
Soroban contract for token distributions:
- Equal distribution across recipients
- Weighted distribution with custom amounts

### `packages/sdk`
TypeScript SDK for interacting with the deployed contracts.

## 🔗 Related Repositories

- [fundable](https://github.com/Fundable-Protocol/fundable) - Starknet smart contracts
- [evm_client](https://github.com/Fundable-Protocol/evm_client) - EVM client
- [backend-main](https://github.com/Fundable-Protocol/backend-main) - Backend API

## Workflow badges
- ![Contracts CI](https://github.com/Fundable-Protocol/stellar_client/actions/workflows/contracts.yml/badge.svg)

- ![Frontend CI](https://github.com/Fundable-Protocol/stellar_client/actions/workflows/frontend.yml/badge.svg)

- ![Testnet Deploy](https://github.com/Fundable-Protocol/stellar_client/actions/workflows/deploy-testnet.yml/badge.svg)


## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
