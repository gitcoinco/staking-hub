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

# Deploy to Sepolia testnet
$ make deploy-sepolia

# Deploy to Arbitrum
$ make deploy-arbitrum

# Deploy to local Anvil chain
$ make anvil        # Start local chain in one terminal
$ make deploy-anvil # Deploy in another terminal

# Simulate deployment (dry-run)
$ make simulate
```

Required environment variables for deployment:
- `SEPOLIA_RPC_URL`: RPC URL for Sepolia network
- `ARBITRUM_RPC_URL`: RPC URL for Arbitrum network

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
