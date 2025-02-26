import assert from "assert";
import { 
  TestHelpers,
  MerkleAirdrop_Claim
} from "generated";
const { MockDb, MerkleAirdrop } = TestHelpers;

describe("MerkleAirdrop contract Claim event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MerkleAirdrop contract Claim event
  const event = MerkleAirdrop.Claim.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("MerkleAirdrop_Claim is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MerkleAirdrop.Claim.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMerkleAirdropClaim = mockDbUpdated.entities.MerkleAirdrop_Claim.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMerkleAirdropClaim: MerkleAirdrop_Claim = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      claimant: event.params.claimant,
      amount: event.params.amount,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMerkleAirdropClaim, expectedMerkleAirdropClaim, "Actual MerkleAirdropClaim should be the same as the expectedMerkleAirdropClaim");
  });
});
