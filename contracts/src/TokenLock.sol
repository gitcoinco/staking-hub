// Sourced from https://github.com/ensdomains/governance-contracts/blob/3952d969031357fde9f832a86ef8e3e7152f1e90/contracts/TokenLock.sol
// Changes:
// - use EAS for attestation
// - rename lock() to _lock() and make it internal
// - add lock() function to enable batch locking
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@eas/eas-contracts/IEAS.sol";
import "@eas/eas-contracts/EAS.sol";

/**
 * @dev Time-locks tokens according to an unlock schedule.
 */
contract TokenLock {
    ERC20 public immutable token;
    uint256 public immutable unlockBegin;
    uint256 public immutable unlockCliff;
    uint256 public immutable unlockEnd;
    IEAS public immutable eas;

    // Schema UID for token lock attestation
    bytes32 public SCHEMA_UID; // 0x7921498cf146c7f9691caeadbe93da27ad53a12d1ee066e7b013e181663223df

    mapping(address => uint256) public lockedAmounts;
    mapping(address => uint256) public claimedAmounts;

    event Locked(address indexed sender, address indexed recipient, uint256 amount);
    event Claimed(address indexed owner, address indexed recipient, uint256 amount);

    /**
     * @dev Constructor.
     * @param _token The token this contract will lock.l
     * @param _unlockBegin The time at which unlocking of tokens will gin.
     * @param _unlockCliff The first time at which tokens are claimable.
     * @param _unlockEnd The time at which the last token will unlock.
     * @param _eas The EAS contract address
     * @param _schemaUid The Schema UID for the token lock attestation
     */
    constructor(
        ERC20 _token,
        uint256 _unlockBegin,
        uint256 _unlockCliff,
        uint256 _unlockEnd,
        IEAS _eas,
        bytes32 _schemaUid
    ) {
        require(_unlockCliff >= _unlockBegin, "ERC20Locked: Unlock cliff must not be before unlock begin");
        require(_unlockEnd >= _unlockCliff, "ERC20Locked: Unlock end must not be before unlock cliff");
        token = _token;
        unlockBegin = _unlockBegin;
        unlockCliff = _unlockCliff;
        unlockEnd = _unlockEnd;
        eas = _eas;
        SCHEMA_UID = _schemaUid;
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
        uint256[] memory roundId,
        address[] memory recipientId
    ) external {
        require(
            amount.length == chainid.length && amount.length == roundId.length && amount.length == recipientId.length,
            "TokenLock: Invalid input length"
        );
        for (uint256 i = 0; i < amount.length; i++) {
            _lock(amount[i], chainid[i], roundId[i], recipientId[i]);
        }
    }

    /**
     * @dev Transfers tokens from the caller to the token lock contract and locks them.
     *      Requires that the caller has authorised this contract with the token contract.
     * @param amount The number of tokens to transfer and lock.
     * @param chainid The chain ID for the attestation.
     * @param roundId The round ID for the attestation.
     * @param recipientId The recipient ID for the attestation.
     */
    function _lock(uint256 amount, uint256 chainid, uint256 roundId, address recipientId) internal {
        require(block.timestamp < unlockEnd, "TokenLock: Unlock period already complete");
        address recipient = msg.sender;

        lockedAmounts[recipient] += amount;
        require(token.transferFrom(msg.sender, address(this), amount), "TokenLock: Transfer failed");

        // Create attestation with schema parameters
        bytes memory data = abi.encode(
            chainid, // chainId
            roundId, // roundId
            recipientId, // recipientId (from parameter)
            amount // amount
        );

        // Create attestation request data
        AttestationRequestData memory requestData = AttestationRequestData({
            recipient: recipient,
            expirationTime: 0, // No expiration
            revocable: false,
            refUID: bytes32(0),
            data: data,
            value: 0 // No payment
        });

        // Create full attestation request
        AttestationRequest memory request = AttestationRequest({schema: SCHEMA_UID, data: requestData});

        eas.attest(request);

        emit Locked(msg.sender, recipient, amount);
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
