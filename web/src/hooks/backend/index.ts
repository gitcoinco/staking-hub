export * from './useGetPoolSummary';
export * from './useGetRewardsForStaker';
export * from './useGetAllPoolsOverview';
export * from './useGetStakerOverview';

// Dashboard Tab For Recipient ------> useGetStakerOverview
// - total GTC staked by recipient currently 
// - claimable rewards // rewards
// - active stakes count // stakes.length
// - rounds with stakes // rely on stakes to get the sum

// Grants Staking Tab ------> useGetAllPoolsOverview
// - all rounds with total stakes per round     

// Round Details Page + highlighted application ------> useGetPoolSummary
// - round info         
// - application info   
// - stakes  (to get total stakes per application you can use the totalStakesByAnchorAddress)
// - existing stakes made by recipient rewards ( use stakes )

// Claim Page ------> useGetStakerOverview
// - all claimed + unclaimed + pending rewards per round with round metadata and how much user has staked
// - get proof when user clicks on claim  -----> useGetRewardsForRecipient