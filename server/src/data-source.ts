import { DataSource } from 'typeorm';
import { env } from './env';

// Set default values for environment variables
const synchronize = env.SYNCHRONIZE?.toLowerCase() === 'true';
const logging = env.LOGGING?.toLowerCase() === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  synchronize,
  logging,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  subscribers: ['src/subscriber/*.ts'],
});
