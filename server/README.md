# staking-hub-api

## Structure

```
.
├── README.md                   # Project documentation
├── package-lock.json           # Dependency lock file
├── package.json                # Project metadata and dependencies
├── src                         # Source code for the application
│   ├── controller              # Routing controller logic
│   ├── entity                  # TypeORM entities, defining database schemas and relations
│   ├── ext                     # External API integrations
│   ├── migration               # Database migrations for schema changes
│   ├── routes                  # API routes
│   ├── service                 # Business logic and service functions
│   ├── data-source.ts          # Database connection setup and configuration
│   ├── index.ts                # Application entry point
│   ├── repository.ts           # Repositories for data access logic
│   ├── swagger.ts              # Optional: Swagger setup in TypeScript
│   └── utils.ts                # Utility functions and helper methods
└── tsconfig.json               # TypeScript configuration
```

## Getting Started

1. **Basic Setup**:
   ```bash
   npm install
   npm run prepare
   ```
2. **Configure Environment Variables**:
   Create a `.env` file in the root of the project and set the necessary environment variables for database connection.
3. **Setting up your databas**:
- Connect as admin `psql -U your_admin_username -h your_database_host -p your_database_port`
- In `psql` shell, run
  ```shell
  CREATE DATABASE your_database_name;
  CREATE ROLE your_database_username WITH LOGIN PASSWORD 'your_database_password';
  GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_database_username;
  ```
4. **Handling Migration**
- Make changes to the entity
- Generate migration with `npm run generate --name=MigrationName`
- Run migration with `npm run migrate`
- If you need to revert last migration, `npm run revert`
5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
6. **API Overview**
  - Visit `http://localhost:3000/api-docs`

**Note**

- For [Logging.md](./src//logger/logger.md) to understand use winston for logging
- For Try catch handling done via [catchError](./src/utils.ts)
- All routes are documented using [swagger](./src/swagger.ts)

```

GET Endpoint
------

- `router.get('/pools/:chainId/:poolId/rewards?recipientId', getPoolRewards);`
   - get the rewards for all recipient for a given finalised pool
   - get the reward for a recipient for a given finalised pool

- `router.get('/pools/stakes?chainId&alloPoolId', getPoolStakes);`
   - returns all stakes in descending order of stake amount for all pools with pool metadata
   - returns all stakes in descending order of stake amount for a given pool with pool metadata
   - figma: `gtc staker/staking`,


- `router.get('/recipient/:recipientId/stakes?chainId&alloPoolId', getStakesForRecipient);`
   - get all stakes for a recipient for all finalised pools
   - get all stakes for a recipient for a given finalised pool
   - figma: `gtc staker/dash/connected`,


POST Endpoint
------
- `router.post('/pools/', createPool);`
   - create a pool 
   - will be called manually by admin

- `router.post('/pools/calculate', calculate);`
   - calculate the rewards for the stakers of a given pool which been fianlise 
   - will be called manually by admin

- `router.post('/recipient/:recipientId/:signature/rewards?chainId&alloPoolId', getRewardsForRecipient);`
   - get the rewards for a recipient for all finalised pools with proof where the recipient has stake
   - get the rewards for a recipient for a given finalised pool with proof
   - figma: `gtc staker/claim rewards`,
   -  kurt -> who fetches application metadata ?


```

### Flow
- Round Starts
- Funder funds pool and the stake rewards pool (with 18k)
- Projects apply and get approved
- Projects show up on explorer
- Anyone with GTC on arbitrum can stake tokens on a project in a round
- for a every project, we keep track who has staked how much (aka we know the % ) and at what time
- Once the round ends, QF distribution runs and we know which projects get what % of the pot
- If project A gets 5% of the pot , then reward pot for staking on project is 5% of 18k (900)
- This 900 is split between the stakers based on how much % they had staked
- If wallet1 accounts for 50% of the staked tokens for project A -> they get 50% of 900 (450)
- If wallet2 accounts for 1% of the staked tokens for project A-> they get 1% of 900 (9)

