## Deployment

### Prerequisites

1. **Install Soroban CLI**
```bash
   cargo install --locked stellar-cli@25.0.0
```

2. **Create Stellar Account**
   - For testnet: [Friendbot](https://developers.stellar.org/docs/networks#friendbot)
   - For mainnet: Use a secure wallet

3. **Configure Environment**
```bash
   cp .env.example .env
   # Edit .env with your configuration
```

### Deploy to Testnet
```bash
# Set network in .env
NETWORK=testnet
```

### Deployment Records

All deployments are automatically saved in `deployments`:
- `testnet.json` - Check for Deployed contract details


### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NETWORK` | Target network (testnet/mainnet) | Yes |
| `STELLAR_SECRET_KEY` | Deployment account secret key | Yes |
| `TESTNET_RPC_URL` | Testnet RPC endpoint | Yes |

### Verification

After deployment, verify your contracts details:
```bash
# View deployment record
cat deployments/testnet/latest.json
```


# Deploy contracts
Follow the following steps to deploy your contracts using the `deploy.sh` file
1. Set the environment variables using `set -e`
2. Set the list of contracts to read and deploy using the snippet below:
```bash
CONTRACTS=(
  payment_stream
  distributor
)
```
3. Load the environment variables using `source .env`
4. Created a Deployments folder, inside the folder, create two `json` files to keep the Contract IDs for deployment on the Testnet and Mainnet.
5. Allow your deployment script to read the required Stellar Paraphrase using `NETWORK_PARAPHRASE=${TESTNET_NETWORK_PASSPHRASE}`
6. When deploying your contracts' `wasm` files, loop over all the available contracts in your project using the code snippet below:
```bash
for CONTRACT in "${CONTRACTS[@]}"; do
  WASM_PATH="contracts/target/wasm32-unknown-unknown/release/${CONTRACT}.wasm"
```
7. Get your depoyed CONTRACT_ID by deploying your Stellar contracts using the required details in the code block below:
```bash
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source "$STELLAR_SECRET_KEY" \
  --network "$NETWORK" \
  --network-passphrase "$NETWORK_PARAPHRASE")
```
8. And, finally deploy your contract using `./scripts/deploy.sh`

# Initialize contracts
Once your contracts are successfully deployed, initialize the contracts in the steps below.
1. Set the environment variables.
2. Load your contracts in a `CONTRACTS` variable.
3. Load the environment variables.
4. Loop over the deployed contracts' addressess in the deployments folder using the snippet below.
```bash
for CONTRACT in "${CONTRACTS[@]}"; do
  CONTRACT_ID=$(jq -r ".${CONTRACT}" "$DEPLOYMENTS_FILE")
```
5. Invoke the Contracts using the code block below.
```bash
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source "$STELLAR_SECRET_KEY" \
  --network-passphrase "$NETWORK_PARAPHRASE"\
  -- \
  initialize \
  --admin "$STELLAR_SECRET_KEY"
```
6. Run the code snippet below to initialize your contracts
`./scripts/initialize.sh`