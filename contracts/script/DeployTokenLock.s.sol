// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "forge-std/Script.sol";
import "../src/TokenLock.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@eas/eas-contracts/EAS.sol";

contract DeployTokenLock is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock token and EAS
        ERC20 token = ERC20(address(1));
        EAS eas = EAS(address(1));

        // Setup unlock schedule
        uint256 unlockBegin = block.timestamp;
        uint256 unlockCliff = block.timestamp + 30 days;
        uint256 unlockEnd = block.timestamp + 365 days;
        bytes32 schemaUID = 0x7921498cf146c7f9691caeadbe93da27ad53a12d1ee066e7b013e181663223df;

        // Deploy TokenLock with EAS
        new TokenLock(token, unlockBegin, unlockCliff, unlockEnd, eas, schemaUID);

        vm.stopBroadcast();
    }
}
