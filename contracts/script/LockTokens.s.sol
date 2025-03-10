// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "forge-std/Script.sol";
import "../src/TokenLock.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LockTokens is Script {
    // Configuration
    address public constant TOKEN_ADDRESS = 0x769E088b0165BA73D26E0642E26e2C969C24B1e3; // Replace with actual token address
    address public constant TOKEN_LOCK_ADDRESS = 0x9Aa6321b15A9c4da0cb5E81B3F3B3b3F6065Aa4a; // Replace with deployed TokenLock address

    // Example lock parameters - customize as needed
    uint256[] public amounts = [1e18, 2e18]; // Amount of tokens to lock
    uint256[] public chainIds = [42161, 42161]; // Chain IDs for attestation
    uint256[] public poolIds = [609, 609]; // Pool IDs (changed from roundIds)
    address[] public recipientIds =
        [0x83ba0Bd26A20A2c5f4e9157242B0c0eE659b7A2C, 0xFEED71D3b495152808BC05E65F113b67Af3bB2c5]; // Recipient IDs for attestation

    function run() public {
        // Get private key from environment
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(privateKey);

        // Get token contract
        IERC20 token = IERC20(TOKEN_ADDRESS);
        TokenLock tokenLock = TokenLock(TOKEN_LOCK_ADDRESS);

        // Calculate total amount to approve
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        // Approve TokenLock contract to spend tokens
        token.approve(TOKEN_LOCK_ADDRESS, totalAmount);

        // Lock tokens
        tokenLock.lock(amounts, chainIds, poolIds, recipientIds);

        vm.stopBroadcast();
    }
}
