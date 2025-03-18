import { type Pool } from '@/entity/Pool';
import { AlreadyExistsError } from '@/errors';
import { Reward, RewardWithChainIdAndPoolId } from '@/ext/indexer';
import { poolRepository } from '@/repository';
import { getMerkleAirdrop } from '@/utils/getMerkleAirdrop';

class PoolService {
  async savePool(pool: Partial<Pool>): Promise<Pool> {
    return await poolRepository.save(pool);
  }

  async createNewPool(chainId: number, alloPoolId: string): Promise<void> {
    const _pool = await this.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId);
    if (_pool !== null) {
      throw new AlreadyExistsError(`Pool already exists`);
    }

    await this.savePool({
      chainId,
      alloPoolId,
    });
  }

  async getPoolById(id: number): Promise<Pool | null> {
    const pool = await poolRepository.findOne({ where: { id } });
    return pool;
  }

  async getPoolByChainIdAndAlloPoolId(
    chainId: number,
    alloPoolId: string
  ): Promise<Pool | null> {
    const pool = await poolRepository.findOne({
      where: { chainId, alloPoolId },
    });
    return pool;
  }

  async getAllPools(page = 1, limit = 10): Promise<Pool[]> {
    return await poolRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getPoolRewards(
    chainId: number,
    alloPoolId: string,
    staker?: string
  ): Promise<Reward[]> {
    const pool = await this.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId);
    if (pool == null) {
      throw new Error('Pool not found');
    }

    const rewards = pool.rewards.filter(reward => reward.staker === staker);

    if (rewards.length === 0) {
      throw new Error('No rewards found');
    }

    return rewards.map(reward => ({
      staker: reward.staker,
      amount: reward.amount,
    }));
  }

  async getRewardsForStaker(
    staker: string,
    chainId?: number,
    alloPoolId?: string
  ): Promise<RewardWithChainIdAndPoolId[]> {
    let pools: Pool[] = [];

    if (chainId !== undefined && alloPoolId !== undefined) {
      const pool = await this.getPoolByChainIdAndAlloPoolId(
        chainId,
        alloPoolId
      );
      if (pool == null) {
        throw new Error('Pool not found');
      }
      pools.push(pool);
    } else {
      pools = await this.getAllPools();
    }

    // Filter rewards by staker
    const rewards: RewardWithChainIdAndPoolId[] = pools
      .flatMap(pool => {
        return pool?.rewards?.map(reward => ({
          ...reward,
          chainId: pool.chainId,
          poolId: pool.alloPoolId,
          merkleAirdropAddress: getMerkleAirdrop(
            pool.alloPoolId,
            pool.chainId.toString()
          ),
        }));
      })
      .filter(reward => reward && reward.staker === staker);

    return rewards;
  }
}

const poolService = new PoolService();
export default poolService;
