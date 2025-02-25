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

        // Token, EAS, unlock date and schemaUID
        ERC20 token = ERC20(0x769E088b0165BA73D26E0642E26e2C969C24B1e3);
        EAS eas = EAS(0xC2679fBD37d54388Ce493F1DB75320D236e1815e);
        uint256 unlockDate = block.timestamp + 7 days;
        bytes32 schemaUID = 0x7921498cf146c7f9691caeadbe93da27ad53a12d1ee066e7b013e181663223df;

        // Setup unlock schedule
        uint256 unlockBegin = unlockDate;
        uint256 unlockCliff = unlockDate;
        uint256 unlockEnd = unlockDate;

        // Deploy TokenLock with EAS
        new TokenLock(token, unlockBegin, unlockCliff, unlockEnd, eas, schemaUID);

        vm.stopBroadcast();
    }
}
