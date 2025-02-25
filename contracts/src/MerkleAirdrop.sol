// SPDX-License-Identifier: MIT
// Sourced from https://github.com/ensdomains/governance-contracts/blob/3952d969031357fde9f832a86ef8e3e7152f1e90/contracts/MerkleAirdrop.sol
// Changes:
// - add matchingPool
// - set matchingPool in constructor
// - set Ownable to msg.sender in constructor
// - add returnToMatchingPool parameter to claimTokens
// - update claim event to send funds to matching pool if returnToMatchingPool is true
// - add clawback function
pragma solidity ^0.8.2;

import "./MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

/**
 * @dev A contract to allow users to claim tokens via a 'merkle airdrop'.
 */
contract MerkleAirdrop is Ownable {
    using BitMaps for BitMaps.BitMap;

    address public immutable matchingPool;
    address public immutable sender;
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;
    BitMaps.BitMap private claimed;

    event MerkleRootChanged(bytes32 merkleRoot);
    event Claim(address indexed claimant, uint256 amount);

    /**
     * @dev Constructor.
     * @param _matchingPool The matching pool contract.
     * @param _sender The account to send airdrop tokens from.
     * @param _token The token contract to send tokens with.
     * @param _merkleRoot The merkle root of the airdrop.
     */
    constructor(address _matchingPool, address _sender, IERC20 _token, bytes32 _merkleRoot) Ownable(msg.sender) {
        matchingPool = _matchingPool;
        sender = _sender;
        token = _token;
        merkleRoot = _merkleRoot;
    }

    /**
     * @dev Claims airdropped tokens.
     * @param recipient The account being claimed for.
     * @param amount The amount of the claim being made.
     * @param merkleProof A merkle proof proving the claim is valid.
     * @param returnToMatchingPool Whether to send the matching tokens to the matching pool.
     */
    function claimTokens(address recipient, uint256 amount, bytes32[] calldata merkleProof, bool returnToMatchingPool)
        external
    {
        bytes32 leaf = keccak256(abi.encodePacked(recipient, amount));
        (bool valid, uint256 index) = MerkleProof.verify(merkleProof, merkleRoot, leaf);
        require(valid, "MerkleAirdrop: Valid proof required.");
        require(!isClaimed(index), "MerkleAirdrop: Tokens already claimed.");

        claimed.set(index);
        emit Claim(recipient, amount);

        if (returnToMatchingPool) {
            token.transferFrom(sender, matchingPool, amount);
        } else {
            token.transferFrom(sender, recipient, amount);
        }
    }

    /**
     * @dev Returns true if the claim at the given index in the merkle tree has already been made.
     * @param index The index into the merkle tree.
     */
    function isClaimed(uint256 index) public view returns (bool) {
        return claimed.get(index);
    }

    /**
     * @dev Claws back the remaining tokens to the matching pool.
     * @notice Only the owner can call this function.
     */
    function clawback() external onlyOwner {
        token.transfer(matchingPool, token.balanceOf(address(this)));
    }
}
