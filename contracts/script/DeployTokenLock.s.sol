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
        ERC20 token = ERC20(0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F);

        uint256 unlockDate = 1744847940;

        // Setup unlock schedule
        uint256 unlockBegin = unlockDate;
        uint256 unlockCliff = unlockDate;
        uint256 unlockEnd = unlockDate;

        // Deploy TokenLock (removed EAS params)
        new TokenLock(token, unlockBegin, unlockCliff, unlockEnd);

        vm.stopBroadcast();
    }
}
