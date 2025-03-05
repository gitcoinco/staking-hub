// SPDX-License-Identifier: MIT
// forge script script/MeasureTokenLockGas.s.sol --rpc-url https://mainnet.infura.io/v3/<api-key> -vvv
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenLock.sol";
import "../src/mocks/MockERC20.sol";

contract MeasureTokenLockGas is Script {
    TokenLock public tokenLock;
    MockERC20 public token;

    function setUp() public {
        token = new MockERC20();
        tokenLock = new TokenLock(token, block.timestamp, block.timestamp + 7 days, block.timestamp + 7 days);
    }

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        setUp();

        // Measure and log gas for approve
        uint256 approveGas = gasleft();
        token.approve(address(tokenLock), type(uint256).max);
        approveGas = approveGas - gasleft();
        console.log("Gas used for approve: %s", approveGas);

        measureLockGas(1);
        measureLockGas(2);
        measureLockGas(5);
        measureLockGas(10);
        measureLockGas(15);
        measureLockGas(20);

        vm.stopBroadcast();
    }

    function measureLockGas(uint256 count) internal {
        uint256[] memory amounts = new uint256[](count);
        uint256[] memory chainIds = new uint256[](count);
        uint256[] memory poolIds = new uint256[](count);
        address[] memory recipients = new address[](count);

        for (uint256 i = 0; i < count; i++) {
            amounts[i] = 1000 * 1e18;
            chainIds[i] = 1;
            poolIds[i] = i + 1;
            recipients[i] = address(uint160(i + 1));
        }

        uint256 gasUsed = gasleft();
        tokenLock.lock(amounts, chainIds, poolIds, recipients);
        gasUsed = gasUsed - gasleft();

        console.log("Gas used for %s recipients: %s", count, gasUsed);
    }
}
