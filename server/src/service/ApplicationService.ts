import { applicationRepository } from '@/repository';
import { Application } from '@/entity/Application';
import poolService from './PoolService';
import { In } from 'typeorm';
import { NotFoundError } from '@/errors';

class ApplicationService {
  async createApplication(
    application: Partial<Application>
  ): Promise<Application> {
    return await applicationRepository.save(application);
  }

  async createApplications(
    applications: Array<Partial<Application>>
  ): Promise<Application[]> {
    return await applicationRepository.save(applications);
  }

  async getApplicationsByPoolId(
    alloPoolId: string,
    chainId: number
  ): Promise<Application[]> {
    const applications = await applicationRepository.find({
      where: {
        pool: { alloPoolId },
        chainId,
      },
      relations: { pool: true },
    });
    return applications;
  }

  async getApplicationByAlloPoolIdAndAlloApplicationId(
    alloPoolId: string,
    chainId: number,
    alloApplicationId: string
  ): Promise<Application | null> {
    const application = await applicationRepository.findOne({
      where: {
        pool: { alloPoolId },
        chainId,
        alloApplicationId,
      },
      relations: { pool: true },
    });

    return application;
  }

  async upsertApplicationsForPool(
    alloPoolId: string,
    chainId: number,
    applicationData: Array<{ alloApplicationId: string; profileId: string }>
  ): Promise<Application[]> {
    const existingApplications = await this.getApplicationsByPoolId(
      alloPoolId,
      chainId
    );

    const pool = await poolService.getPoolByChainIdAndAlloPoolId(
      chainId,
      alloPoolId
    );
    if (pool == null) {
      throw new NotFoundError(
        `Pool not found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
      );
    }

    const newApplications = await Promise.all(
      applicationData
        .filter(
          ({ alloApplicationId }) =>
            !existingApplications.some(
              existingApplication =>
                existingApplication.alloApplicationId === alloApplicationId
            )
        )
        .map(async ({ alloApplicationId, profileId }) => {
          // Instantiate a new Application entity
          const application = new Application();
          application.chainId = chainId;
          application.alloApplicationId = alloApplicationId;
          application.pool = pool;
          application.poolId = pool.id;

          // Return the new Application entity
          return application;
        })
    );

    return await this.createApplications(newApplications);
  }

  async getApplicationByChainIdPoolIdApplicationId(
    alloPoolId: string,
    chainId: number,
    alloApplicationId: string
  ): Promise<Application | null> {
    const application = await applicationRepository.findOne({
      where: {
        pool: { alloPoolId },
        chainId,
        alloApplicationId,
      },
      relations: ['pool'],
    });

    return application;
  }

  async getApplicationsByChainIdPoolIdApplicationIds(
    alloPoolId: string,
    chainId: number,
    alloApplicationIds: string[]
  ): Promise<Application[]> {
    const applications = await applicationRepository.find({
      where: {
        pool: { alloPoolId },
        chainId,
        alloApplicationId: In(alloApplicationIds),
      },
      relations: ['pool'],
    });

    return applications;
  }
}

const applicationService = new ApplicationService();
export default applicationService;
