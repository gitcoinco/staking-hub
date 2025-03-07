// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IEAS, Attestation } from "./../IEAS.sol";
import { SchemaResolver } from "./../resolver/SchemaResolver.sol";

contract TestSchemaResolver is SchemaResolver {
    constructor(IEAS eas) SchemaResolver(eas) {}

    function onAttest(Attestation calldata /*attestation*/, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }

    function onRevoke(Attestation calldata /*attestation*/, uint256 /*value*/) internal pure override returns (bool) {
        return true;
    }
}
