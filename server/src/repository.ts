import { AppDataSource } from '@/data-source';
import { Pool } from '@/entity/Pool';

// Export repositories for each entity
export const poolRepository = AppDataSource.getRepository(Pool);
