// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {Script} from "forge-std/Script.sol";
import {MerkleAirdrop} from "../src/MerkleAirdrop.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployMerkleAirdrop is Script {
    function run() external returns (MerkleAirdrop) {
        // Load deployment parameters from environment
        address matchingPool = vm.envAddress("MATCHING_POOL_ADDRESS");
        address sender = vm.envAddress("SENDER_ADDRESS");
        address token = vm.envAddress("TOKEN_ADDRESS");
        bytes32 merkleRoot = vm.envBytes32("MERKLE_ROOT");

        vm.startBroadcast();
        MerkleAirdrop airdrop = new MerkleAirdrop(matchingPool, sender, IERC20(token), merkleRoot);
        vm.stopBroadcast();

        return airdrop;
    }
}
