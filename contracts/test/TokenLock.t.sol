// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "forge-std/Test.sol";
import "../src/TokenLock.sol";
import "../src/mocks/MockERC20.sol";
import "../src/mocks/MockEAS.sol";

contract TokenLockTest is Test {
    TokenLock public tokenLock;
    MockERC20 public token;
    MockEAS public eas;
    bytes32 public constant SCHEMA_UID = 0x7921498cf146c7f9691caeadbe93da27ad53a12d1ee066e7b013e181663223df;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    
    uint256 public constant INITIAL_BALANCE = 1000000 * 1e18;
    uint256 public unlockBegin;
    uint256 public unlockCliff;
    uint256 public unlockEnd;

    function setUp() public {
        // Deploy mock token and EAS
        token = new MockERC20();
        eas = new MockEAS();
        
        // Setup unlock schedule
        unlockBegin = block.timestamp;
        unlockCliff = block.timestamp + 30 days;
        unlockEnd = block.timestamp + 365 days;
        
        // Deploy TokenLock with EAS
        tokenLock = new TokenLock(
            token,
            unlockBegin,
            unlockCliff,
            unlockEnd,
            eas,
            SCHEMA_UID
        );

        // Setup test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        
        // Transfer tokens to alice for testing
        token.transfer(alice, 10000 * 1e18);
    }

    // Constructor Tests
    function testConstructorRevert_CliffBeforeBegin() public {
        vm.expectRevert("ERC20Locked: Unlock cliff must not be before unlock begin");
        new TokenLock(
            token,
            block.timestamp + 1 days,
            block.timestamp,
            block.timestamp + 2 days,
            eas,
            SCHEMA_UID
        );
    }

    function testConstructorRevert_EndBeforeCliff() public {
        vm.expectRevert("ERC20Locked: Unlock end must not be before unlock cliff");
        new TokenLock(
            token,
            block.timestamp,
            block.timestamp + 2 days,
            block.timestamp + 1 days,
            eas,
            SCHEMA_UID
        );
    }

    // Lock Tests
    function testLock() public {
        uint256 amount = 1000 * 1e18;
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = alice; // Recipient address
        
        vm.startPrank(alice);
        token.approve(address(tokenLock), amount);
        tokenLock.lock(amounts, chainids, roundIds, recipientIds);
        vm.stopPrank();

        assertEq(tokenLock.lockedAmounts(alice), amount);
        assertEq(token.balanceOf(address(tokenLock)), amount);
    }

    function testLockRevert_AfterUnlockEnd() public {
        vm.warp(unlockEnd + 1);
        
        uint256 amount = 1000 * 1e18;
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = alice; // Recipient address
        
        vm.startPrank(alice);
        token.approve(address(tokenLock), amount);
        vm.expectRevert("TokenLock: Unlock period already complete");
        tokenLock.lock(amounts, chainids, roundIds, recipientIds);
        vm.stopPrank();
    }

    // Claim Tests
    function testClaimBeforeCliff() public {
        uint256 amount = 1000 * 1e18;
        
        // Lock tokens
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = alice; // Recipient address
        
        vm.startPrank(alice);
        token.approve(address(tokenLock), amount);
        tokenLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Try to claim before cliff
        assertEq(tokenLock.claimableBalance(alice), 0);
        tokenLock.claim(alice, amount);
        assertEq(token.balanceOf(alice), 9000 * 1e18); // Original balance - locked amount
        vm.stopPrank();
    }

    function testClaimAfterCliff() public {
        uint256 amount = 1000 * 1e18;
        
        // Lock tokens
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = alice; // Recipient address
        
        vm.startPrank(alice);
        token.approve(address(tokenLock), amount);
        tokenLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Warp to halfway point
        vm.warp(unlockBegin + (unlockEnd - unlockBegin) / 2);
        
        // Should be able to claim approximately half
        uint256 claimable = tokenLock.claimableBalance(alice);
        assertApproxEqRel(claimable, amount / 2, 0.01e18); // 1% tolerance
        
        tokenLock.claim(alice, claimable);
        assertEq(tokenLock.claimedAmounts(alice), claimable);
        vm.stopPrank();
    }

    function testClaimAfterUnlockEnd() public {
        uint256 amount = 1000 * 1e18;
        
        // Lock tokens
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = alice; // Recipient address
        
        vm.startPrank(alice);
        token.approve(address(tokenLock), amount);
        tokenLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Warp to after unlock end
        vm.warp(unlockEnd + 1);
        
        // Should be able to claim everything
        assertEq(tokenLock.claimableBalance(alice), amount);
        
        // Get initial balance
        uint256 initialBalance = token.balanceOf(alice);
        
        // Claim tokens
        tokenLock.claim(alice, amount);
        
        // Verify final balance increased by claimed amount
        assertEq(token.balanceOf(alice), initialBalance + amount);
        assertEq(tokenLock.claimedAmounts(alice), amount);
        vm.stopPrank();
    }

    function testClaimToDifferentRecipient() public {
        uint256 amount = 1000 * 1e18;
        
        // Lock tokens
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = alice; // Recipient address
        
        vm.startPrank(alice);
        token.approve(address(tokenLock), amount);
        tokenLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Warp to after unlock end
        vm.warp(unlockEnd + 1);
        
        // Claim to bob's address
        tokenLock.claim(bob, amount);
        assertEq(token.balanceOf(bob), amount);
        vm.stopPrank();
    }

    function testMultipleLockAndClaims() public {
        uint256 amount = 1000 * 1e18;
        uint256[] memory amounts = new uint256[](2);
        uint256[] memory chainids = new uint256[](2);
        uint256[] memory roundIds = new uint256[](2);
        address[] memory recipientIds = new address[](2);
        
        amounts[0] = amount;
        amounts[1] = amount;
        chainids[0] = 1; // Example chain ID
        chainids[1] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        roundIds[1] = 1; // Example round ID
        recipientIds[0] = alice; // Recipient address
        recipientIds[1] = alice; // Recipient address
        
        // Multiple locks
        vm.startPrank(alice);
        token.approve(address(tokenLock), amount * 2);
        tokenLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Warp to 75% through vesting
        vm.warp(unlockBegin + ((unlockEnd - unlockBegin) * 3) / 4);
        
        // Should be able to claim approximately 75%
        uint256 claimable = tokenLock.claimableBalance(alice);
        assertApproxEqRel(claimable, (amount * 2) * 75 / 100, 0.01e18); // 1% tolerance
        
        // Partial claim
        tokenLock.claim(alice, claimable / 2);
        assertEq(tokenLock.claimedAmounts(alice), claimable / 2);
        
        // Remaining claim
        uint256 remainingClaimable = tokenLock.claimableBalance(alice);
        tokenLock.claim(alice, remainingClaimable);
        assertEq(tokenLock.claimedAmounts(alice), claimable);
        vm.stopPrank();
    }

     /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
     /*                         Our Usecase                        */
     /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/
 
    function testInstantUnlock_Setup() public {
        uint256 lockUntil = block.timestamp + 7 days;
        TokenLock specificLock = new TokenLock(
            token,
            block.timestamp,    // unlockBegin
            lockUntil,         // unlockCliff
            lockUntil,         // unlockEnd
            eas,
            SCHEMA_UID
        );
        
        assertEq(specificLock.unlockCliff(), lockUntil);
        assertEq(specificLock.unlockEnd(), lockUntil);
    }

    function testInstantUnlock_NothingClaimableBeforeUnlock() public {
        uint256 lockUntil = block.timestamp + 7 days;
        TokenLock specificLock = new TokenLock(
            token,
            block.timestamp,
            lockUntil,
            lockUntil,
            eas,
            SCHEMA_UID
        );
        
        uint256 amount = 100 * 1e18;
        
        // Setup bob with tokens and lock them
        token.transfer(bob, amount);
        vm.startPrank(bob);
        token.approve(address(specificLock), amount);
        
        // Create arrays for lock parameters
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = bob; // Recipient address
        
        specificLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Check at start
        assertEq(specificLock.claimableBalance(bob), 0);
        
        // Check just before unlock
        vm.warp(lockUntil - 1);
        assertEq(specificLock.claimableBalance(bob), 0);
        vm.stopPrank();
    }

    function testInstantUnlock_EverythingClaimableAtUnlock() public {
        uint256 lockUntil = block.timestamp + 7 days;
        TokenLock specificLock = new TokenLock(
            token,
            block.timestamp,
            lockUntil,
            lockUntil,
            eas,
            SCHEMA_UID
        );
        
        uint256 amount = 100 * 1e18;
        
        // Setup bob with tokens and lock them
        token.transfer(bob, amount);
        vm.startPrank(bob);
        token.approve(address(specificLock), amount);
        
        // Create arrays for lock parameters
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = bob; // Recipient address
        
        specificLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Warp to unlock time
        vm.warp(lockUntil);
        
        // Should be able to claim full amount
        assertEq(specificLock.claimableBalance(bob), amount);
        
        // Claim and verify balance
        specificLock.claim(bob, amount);
        assertEq(token.balanceOf(bob), amount);
        vm.stopPrank();
    }

    function testInstantUnlock_ClaimableForever() public {
        uint256 lockUntil = block.timestamp + 7 days;
        TokenLock specificLock = new TokenLock(
            token,
            block.timestamp,
            lockUntil,
            lockUntil,
            eas,
            SCHEMA_UID
        );
        
        uint256 amount = 100 * 1e18;
        
        // Setup bob with tokens and lock them
        token.transfer(bob, amount);
        vm.startPrank(bob);
        token.approve(address(specificLock), amount);
        
        // Create arrays for lock parameters
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory chainids = new uint256[](1);
        uint256[] memory roundIds = new uint256[](1);
        address[] memory recipientIds = new address[](1);
        
        amounts[0] = amount;
        chainids[0] = 1; // Example chain ID
        roundIds[0] = 1; // Example round ID
        recipientIds[0] = bob; // Recipient address
        
        specificLock.lock(amounts, chainids, roundIds, recipientIds);
        
        // Warp way into the future
        vm.warp(lockUntil + 365 days);
        
        // Should still be able to claim full amount
        assertEq(specificLock.claimableBalance(bob), amount);
        
        // Claim and verify balance
        specificLock.claim(bob, amount);
        assertEq(token.balanceOf(bob), amount);
        vm.stopPrank();
    }
} 