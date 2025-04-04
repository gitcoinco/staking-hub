// Sourced from https://github.com/ensdomains/governance-contracts/blob/3952d969031357fde9f832a86ef8e3e7152f1e90/contracts/TokenLock.sol
// Changes:
// - update Locked event to include chainId, poolId and recipientId
// - rename lock() to _lock() and make it internal
// - add lock() function to enable batch locking
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev Time-locks tokens according to an unlock schedule.
 */
contract TokenLock {
    ERC20 public immutable token;
    uint256 public immutable unlockBegin;
    uint256 public immutable unlockCliff;
    uint256 public immutable unlockEnd;

    mapping(address => uint256) public lockedAmounts;
    mapping(address => uint256) public claimedAmounts;

    event Locked(address indexed owner, uint256 chainId, uint256 poolId, address indexed recipientId, uint256 amount);
    event Claimed(address indexed owner, address indexed recipient, uint256 amount);

    /**
     * @dev Constructor.
     * @param _token The token this contract will lock.l
     * @param _unlockBegin The time at which unlocking of tokens will gin.
     * @param _unlockCliff The first time at which tokens are claimable.
     * @param _unlockEnd The time at which the last token will unlock.
     */
    constructor(ERC20 _token, uint256 _unlockBegin, uint256 _unlockCliff, uint256 _unlockEnd) {
        require(_unlockCliff >= _unlockBegin, "ERC20Locked: Unlock cliff must not be before unlock begin");
        require(_unlockEnd >= _unlockCliff, "ERC20Locked: Unlock end must not be before unlock cliff");
        token = _token;
        unlockBegin = _unlockBegin;
        unlockCliff = _unlockCliff;
        unlockEnd = _unlockEnd;
    }

    /**
     * @dev Returns the maximum number of tokens currently claimable by `owner`.
     * @param owner The account to check the claimable balance of.
     * @return The number of tokens currently claimable.
     */
    function claimableBalance(address owner) public view returns (uint256) {
        if (block.timestamp < unlockCliff) {
            return 0;
        }

        uint256 locked = lockedAmounts[owner];
        uint256 claimed = claimedAmounts[owner];
        if (block.timestamp >= unlockEnd) {
            return locked - claimed;
        }
        return (locked * (block.timestamp - unlockBegin)) / (unlockEnd - unlockBegin) - claimed;
    }

    function lock(
        uint256[] memory amount,
        uint256[] memory chainid,
        uint256[] memory poolId,
        address[] memory recipientId
    ) external {
        require(
            amount.length == chainid.length && amount.length == poolId.length && amount.length == recipientId.length,
            "TokenLock: Invalid input length"
        );
        for (uint256 i = 0; i < amount.length; i++) {
            _lock(amount[i], chainid[i], poolId[i], recipientId[i]);
        }
    }

    /**
     * @dev Transfers tokens from the caller to the token lock contract and locks them.
     *      Requires that the caller has authorised this contract with the token contract.
     * @param amount The number of tokens to transfer and lock.
     * @param chainid The chain for which the staking is done
     * @param poolId The pool for which the staking is done
     * @param recipientId The recipient for whom the staking is done
     */
    function _lock(uint256 amount, uint256 chainid, uint256 poolId, address recipientId) internal {
        require(block.timestamp < unlockEnd, "TokenLock: Unlock period already complete");

        lockedAmounts[msg.sender] += amount;
        require(token.transferFrom(msg.sender, address(this), amount), "TokenLock: Transfer failed");

        emit Locked(msg.sender, chainid, poolId, recipientId, amount);
    }

    /**
     * @dev Claims the caller's tokens that have been unlocked, sending them to `recipient`.
     * @param recipient The account to transfer unlocked tokens to.
     * @param amount The amount to transfer. If greater than the claimable amount, the maximum is transferred.
     */
    function claim(address recipient, uint256 amount) external {
        uint256 claimable = claimableBalance(msg.sender);
        if (amount > claimable) {
            amount = claimable;
        }
        claimedAmounts[msg.sender] += amount;
        require(token.transfer(recipient, amount), "TokenLock: Transfer failed");
        emit Claimed(msg.sender, recipient, amount);
    }
}
