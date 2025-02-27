import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Unique,
} from 'typeorm';

interface Reward {
  recipientId: string;
  amount: string;
  proof: string[];
}

@Entity()
@Unique(['chainId', 'alloPoolId'])
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @Column('simple-json', { nullable: true })
  rewards: Reward[];

  @Column('text', { nullable: true })
  merkleRoot: string;
}

// - Round Starts
// - Funder funds pool and the stake rewards pool (with 18k)
// - Projects apply and get approved
// - Projects show up on explorer
// - Anyone with GTC on arbitrum can stake tokens on a project in a round
// - for a every project, we keep track who has staked how much (aka we know the % ) and at what time
// - Once the round ends, QF distribution runs and we know which projects get what % of the pot
// - If project A gets 5% of the pot , then reward pot for staking on project is 5% of 18k (900)
// - This 900 is split between the stakers based on how much % they had staked
// - If wallet1 accounts for 50% of the staked tokens for project A -> they get 50% of 900 (450)
// - If wallet2 accounts for 1% of the staked tokens for project A-> they get 1% of 900 (9)


// POST -> calculate 
// GET -> get your proof + address + amount (auth needed)
// GET -> get all amounts and address with filter to get for 1 address