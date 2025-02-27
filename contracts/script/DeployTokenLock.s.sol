// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "forge-std/Script.sol";
import "../src/TokenLock.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeployTokenLock is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Token and unlock date only (removed EAS-related params)
        ERC20 token = ERC20(0x769E088b0165BA73D26E0642E26e2C969C24B1e3);
        uint256 unlockDate = block.timestamp + 7 days;

        // Setup unlock schedule
        uint256 unlockBegin = unlockDate;
        uint256 unlockCliff = unlockDate;
        uint256 unlockEnd = unlockDate;

        // Deploy TokenLock (removed EAS params)
        new TokenLock(token, unlockBegin, unlockCliff, unlockEnd);

        vm.stopBroadcast();
    }
}
