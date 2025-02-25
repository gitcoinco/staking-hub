## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

The project includes a Makefile with several deployment options:

```shell
# Install dependencies first
$ make install

# Deploy TokenLock contract
$ make deploy-tokenlock-sepolia    # Deploy to Sepolia
$ make deploy-tokenlock-arbitrum   # Deploy to Arbitrum

# Deploy MerkleAirdrop contract
$ make deploy-airdrop-sepolia      # Deploy to Sepolia
$ make deploy-airdrop-arbitrum     # Deploy to Arbitrum

# Deploy to local Anvil chain
$ make anvil                # Start local chain in one terminal
$ make deploy-tokenlock-anvil  # Deploy TokenLock
$ make deploy-airdrop-anvil    # Deploy MerkleAirdrop

# Simulate deployment (dry-run)
$ make simulate
```

Required environment variables for deployment:
- `SEPOLIA_RPC_URL`: RPC URL for Sepolia network
- `ARBITRUM_RPC_URL`: RPC URL for Arbitrum network

For MerkleAirdrop deployment, additional environment variables are required:
- `MATCHING_POOL_ADDRESS`: Address of the matching pool contract
- `SENDER_ADDRESS`: Address of the account sending airdrop tokens
- `TOKEN_ADDRESS`: Address of the ERC20 token contract
- `MERKLE_ROOT`: Merkle root of the airdrop claims

Additional Makefile commands:
```shell
$ make build      # Build contractsß
$ make test       # Run tests
$ make test-gas   # Run tests with gas reporting
$ make clean      # Clean build artifacts
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
