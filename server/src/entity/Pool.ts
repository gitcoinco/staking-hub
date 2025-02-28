import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Unique,
} from 'typeorm';

export interface Reward {
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