// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@eas/eas-contracts/IEAS.sol";
import "@eas/eas-contracts/ISchemaRegistry.sol";

contract MockEAS is IEAS {
    function getSchemaRegistry() external pure returns (ISchemaRegistry) {
        return ISchemaRegistry(address(0));
    }

    function attest(AttestationRequest calldata) external payable returns (bytes32) {
        return bytes32(uint256(1));
    }

    function attestByDelegation(DelegatedAttestationRequest calldata) external payable returns (bytes32) {
        return bytes32(uint256(1));
    }

    function multiAttest(MultiAttestationRequest[] calldata) external payable returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](1);
        result[0] = bytes32(uint256(1));
        return result;
    }

    function multiAttestByDelegation(MultiDelegatedAttestationRequest[] calldata) external payable returns (bytes32[] memory) {
        bytes32[] memory result = new bytes32[](1);
        result[0] = bytes32(uint256(1));
        return result;
    }

    function revoke(RevocationRequest calldata) external payable {}

    function revokeByDelegation(DelegatedRevocationRequest calldata) external payable {}

    function multiRevoke(MultiRevocationRequest[] calldata) external payable {}

    function multiRevokeByDelegation(MultiDelegatedRevocationRequest[] calldata) external payable {}

    function timestamp(bytes32) external view returns (uint64) {
        return uint64(block.timestamp);
    }

    function multiTimestamp(bytes32[] calldata) external view returns (uint64) {
        return uint64(block.timestamp);
    }

    function revokeOffchain(bytes32) external view returns (uint64) {
        return uint64(block.timestamp);
    }

    function multiRevokeOffchain(bytes32[] calldata) external view returns (uint64) {
        return uint64(block.timestamp);
    }

    function getAttestation(bytes32) external pure returns (Attestation memory) {
        return Attestation({
            uid: bytes32(0),
            schema: bytes32(0),
            recipient: address(0),
            attester: address(0),
            time: 0,
            expirationTime: 0,
            revocable: true,
            refUID: bytes32(0),
            data: "",
            revocationTime: 0
        });
    }

    function isAttestationValid(bytes32) external pure returns (bool) {
        return true;
    }

    function getTimestamp(bytes32) external pure returns (uint64) {
        return 0;
    }

    function getRevokeOffchain(address, bytes32) external pure returns (uint64) {
        return 0;
    }

    function version() external pure returns (string memory) {
        return "1.0.0";
    }
} 