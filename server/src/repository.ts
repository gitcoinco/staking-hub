import { AppDataSource } from '@/data-source';
import { Pool } from '@/entity/Pool';
import { Application } from '@/entity/Application';

// Export repositories for each entity
export const poolRepository = AppDataSource.getRepository(Pool);
export const applicationRepository = AppDataSource.getRepository(Application);
