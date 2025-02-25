import { env } from './env';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '@/swagger';
import { AppDataSource } from '@/data-source';
import routes from '@/routes';
import { createLogger } from '@/logger';
import { postgraphileMiddleware } from '@/postgraphile.config';
import { BaseError } from '@/errors';
import { execSync } from 'child_process';

// Configure process-level error handlers before app initialization
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection:', { error: reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error });
  // Give the process time to log the error before exiting
  setTimeout(() => process.exit(1), 1000);
});

// Initialize Express app
const app = express();
const logger = createLogger();

app.use(cors());

app.get('/', (req, res) => {
  res.json({
    deployedCommitHash: `https://github.com/gitcoinco/retrofunding-api/commit/${execSync('git rev-parse HEAD').toString().trim()}`,
    message: 'Welcome to the Retrofunding Campaign! 🌟',
    apis: '/api-docs',
    graphiql: '/graphiql',
    status: 'Ready to run a retrofunding campaign!',
    data: {
      current_task: 'Participate in the retrofunding campaign 🚀',
      next_step: 'Allocate your votes to the projects that matter most to you 🎯',
      metrics: ['Impact', 'Innovation', 'Feasibility'],
      projects: [
        { name: 'Project Alpha', scores: { Impact: 85, Innovation: 90, Feasibility: 80 } },
        { name: 'Project Beta', scores: { Impact: 78, Innovation: 85, Feasibility: 88 } },
        { name: 'Project Gamma', scores: { Impact: 92, Innovation: 88, Feasibility: 75 } },
      ],
    },
    tips: [
      'Consider which metrics are most important to you when voting! 🗳️',
      'Review each project\'s scores across different metrics! 📊',
      'Your votes help determine funding allocation! 💰',
    ],
    joke: "Why did the project manager bring a ladder to the retrofunding campaign? Because they wanted to reach new heights in metrics! 🪜",
  });
});

// Swagger setup
const specs = swaggerJsDoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve as express.RequestHandler,
  swaggerUi.setup(specs) as express.RequestHandler
);

// Configure GraphQL server
app.use(postgraphileMiddleware);

// Configure JSON body parser
app.use(express.json());

// Configure global error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({
      name: err.name,
      message: err.message,
      status: err.statusCode,
    });
  } else {
    logger.error('Unhandled error:', {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    res.status(500).json({
      name: 'InternalServerError',
      message: 'An unexpected error occurred',
      status: 500,
    });
  }
});

// Configure routes
app.use('/api', routes);

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    logger.info('Connected to database!');
  })
  .catch(error => {
    logger.error('Error connecting to database:', { error });
  });

const port = Number(env.PORT ?? 3000);

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(
    `API documentation available at http://localhost:${port}/api-docs`
  );
});