// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {Script} from "forge-std/Script.sol";
import {MerkleAirdrop} from "../src/MerkleAirdrop.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployMerkleAirdrop is Script {
    function run() external returns (MerkleAirdrop) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address matchingPool = 0x7cFC79051ba6D09916A6b881Cf4894CaE83BcC4c;
        address sender = 0x7cFC79051ba6D09916A6b881Cf4894CaE83BcC4c;
        address token = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
        bytes32 merkleRoot = 0x014a239e397b09622969f695efa7b6ece3d02d8af6cee0da4207faa411fbdb60;
        uint256 chainId = 1;
        uint256 poolId = 867;

        MerkleAirdrop airdrop = new MerkleAirdrop(matchingPool, sender, IERC20(token), merkleRoot, chainId, poolId);
        vm.stopBroadcast();

        return airdrop;
    }
}
