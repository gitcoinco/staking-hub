// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import {Script} from "forge-std/Script.sol";
import {MerkleAirdrop} from "../src/MerkleAirdrop.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployMerkleAirdrop is Script {
    function run() external returns (MerkleAirdrop) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address matchingPool = 0x5645bF145C3f1E974D0D7FB91bf3c68592ab5012;
        address sender = 0x5645bF145C3f1E974D0D7FB91bf3c68592ab5012;
        address token = 0x5e7C95EaF08D6FeD05a8E4BC607Fb682834C74cE;
        bytes32 merkleRoot = 0x4b76bcc5479b1f30b59a99b588b8bbf09472e15edb8770dad2e1d603b0cf45e9;
        uint256 chainId = 11155111;
        uint256 poolId = 706;

        MerkleAirdrop airdrop = new MerkleAirdrop(matchingPool, sender, IERC20(token), merkleRoot, chainId, poolId);
        vm.stopBroadcast();

        return airdrop;
    }
}
