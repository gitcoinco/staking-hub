// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "forge-std/Test.sol";
import "../src/MerkleAirdrop.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Mock ERC20 token for testing
contract MockToken is ERC20 {
    constructor() ERC20("Mock", "MCK") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}

contract MerkleAirdropTest is Test {
    MerkleAirdrop public airdrop;
    MockToken public token;
    address public matchingPool;
    address public sender;
    address public recipient1;
    address public recipient2;
    bytes32 public merkleRoot;
    uint256 public chainId;
    uint256 public poolId;

    // Test data for merkle tree
    bytes32[] public proof1;
    bytes32[] public proof2;
    uint256 public amount1 = 100 * 10 ** 18;
    uint256 public amount2 = 200 * 10 ** 18;

    event Claim(address indexed claimant, uint256 amount, uint256 chainId, uint256 poolId);
    event Clawback(address indexed clawbackAddress, uint256 amount, address token);

    function setUp() public {
        // Create test accounts
        matchingPool = makeAddr("matchingPool");
        sender = makeAddr("sender");
        recipient1 = makeAddr("recipient1");
        recipient2 = makeAddr("recipient2");

        // Set chain and pool IDs for testing
        chainId = 1;
        poolId = 1;

        // Deploy token and mint to sender
        token = new MockToken();

        // Create merkle tree data
        // In a real scenario, you would generate these using a merkle tree library
        bytes32 leaf1 = keccak256(abi.encodePacked(recipient1, amount1));
        bytes32 leaf2 = keccak256(abi.encodePacked(recipient2, amount2));

        // For this example, we'll create a simple tree with two leaves
        bytes32 hash12 = keccak256(abi.encodePacked(leaf1, leaf2));
        merkleRoot = hash12;

        // Set up proofs (simplified for testing)
        proof1 = new bytes32[](1);
        proof1[0] = leaf2;

        proof2 = new bytes32[](1);
        proof2[0] = leaf1;

        // Deploy airdrop contract
        airdrop = new MerkleAirdrop(matchingPool, sender, token, merkleRoot, chainId, poolId);

        // Transfer tokens to sender and approve airdrop contract
        token.transfer(sender, 1000 * 10 ** 18);
        vm.prank(sender);
        token.approve(address(airdrop), type(uint256).max);
    }

    function testConstructor() public view {
        assertEq(address(airdrop.matchingPool()), matchingPool);
        assertEq(address(airdrop.sender()), sender);
        assertEq(address(airdrop.token()), address(token));
        assertEq(airdrop.merkleRoot(), merkleRoot);
        assertEq(airdrop.chainId(), chainId);
        assertEq(airdrop.poolId(), poolId);
        assertEq(airdrop.owner(), address(this));
    }

    function testClaimTokens() public {
        uint256 initialBalance = token.balanceOf(recipient1);

        vm.expectEmit(true, true, true, true);
        emit Claim(recipient1, amount1, chainId, poolId);

        vm.prank(recipient1);
        airdrop.claimTokens(recipient1, amount1, proof1, false);

        assertEq(token.balanceOf(recipient1), initialBalance + amount1);
    }

    function testClaimTokensToMatchingPool() public {
        uint256 initialBalance = token.balanceOf(matchingPool);

        vm.prank(recipient1);
        airdrop.claimTokens(recipient1, amount1, proof1, true);

        assertEq(token.balanceOf(matchingPool), initialBalance + amount1);
    }

    function testCannotClaimTwice() public {
        vm.prank(recipient1);
        airdrop.claimTokens(recipient1, amount1, proof1, false);

        vm.prank(recipient1);
        vm.expectRevert("MerkleAirdrop: Tokens already claimed.");
        airdrop.claimTokens(recipient1, amount1, proof1, false);
    }

    function testCannotClaimWithInvalidProof() public {
        bytes32[] memory invalidProof = new bytes32[](1);
        invalidProof[0] = bytes32(0);

        vm.prank(recipient1);
        vm.expectRevert("MerkleAirdrop: Valid proof required.");
        airdrop.claimTokens(recipient1, amount1, invalidProof, false);
    }

    function testCannotClaimWithWrongAmount() public {
        vm.prank(recipient1);
        vm.expectRevert("MerkleAirdrop: Valid proof required.");
        airdrop.claimTokens(recipient1, amount2, proof1, false);
    }

    function testClawback() public {
        // First send some tokens to the contract
        uint256 amount = 100 * 10 ** 18;
        token.transfer(address(airdrop), amount);

        uint256 initialBalance = token.balanceOf(matchingPool);

        vm.expectEmit(true, true, true, true);
        emit Clawback(address(this), amount, address(token));

        airdrop.clawback(address(token));

        assertEq(token.balanceOf(matchingPool), initialBalance + amount);
        assertEq(token.balanceOf(address(airdrop)), 0);
    }

    function testCannotClawbackIfNotOwner() public {
        vm.prank(recipient1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, recipient1));
        airdrop.clawback(address(token));
    }

    function testIsClaimed() public {
        assertFalse(airdrop.isClaimed(0));

        vm.prank(recipient1);
        airdrop.claimTokens(recipient1, amount1, proof1, false);

        assertTrue(airdrop.isClaimed(0));
    }
}
