-include .env

.PHONY: install test clean build deploy-sepolia deploy-arbitrum

# Install dependencies
install:
	forge install OpenZeppelin/openzeppelin-contracts

# Clean build artifacts
clean:
	forge clean

# Build contracts
build:
	forge build

# Run tests
test:
	forge test -vv

# Run tests with gas reporting
test-gas:
	forge test -vv --gas-report

# Deploy to Sepolia
deploy-sepolia:
	forge script script/DeployTokenLock.s.sol:DeployTokenLock \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--broadcast \
		--verify \
		-vvvv

# Deploy to Arbitrum
deploy-arbitrum:
	forge script script/DeployTokenLock.s.sol:DeployTokenLock \
		--rpc-url $(ARBITRUM_RPC_URL) \
		--broadcast \
		--verify \
		-vvvv

# Simulate deployment (dry-run)
simulate:
	forge script script/DeployTokenLock.s.sol:DeployTokenLock -vvvv

# Create local anvil chain
anvil:
	anvil

# Deploy to local anvil chain
deploy-anvil:
	forge script script/DeployTokenLock.s.sol:DeployTokenLock \
		--rpc-url http://localhost:8545 \
		--broadcast \
		--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 