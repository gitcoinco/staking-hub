export * from './useGetPoolSummary';
export * from './useGetStakesForRecipient';
export * from './useGetRewardsForRecipient';
export * from './useGetAllPoolsOverview';
// Dashboard Tab For Recipient 
// - total GTC staked by recipient currently 
// - claimable rewards 
// - active stakes
// - rounds with stakes

// Grants Staking Tab ------> useGetAllPoolsOverview
// - all rounds with total stakes per round     

// Round Details Page + highlighted application ------> useGetPoolSummary
// - round info         
// - application info   
// - stakes  (to get total stakes per application you can use the totalStakesByAnchorAddress)
// - existing stakes made by recipient rewards ( use stakes )

// Claim Page (new endpoint C)
// - all claimed + unclaimed + pending rewards per round with round metadata and how much user has staked
// - get proof when user clicks on claim useGetRewardsForRecipient

