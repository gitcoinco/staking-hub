### Logger Usage

This project uses a custom logger based on the `winston` library to handle logging across different modules. The logger provides a consistent format and writes logs to both the console and files.

[Winston Github](https://github.com/winstonjs/winston#readme)

#### Example Usage in a Module

To create a custom logger, use the `createLogger` function, providing a prefix that identifies the source of the log messages.

```ts
import { createLogger } from '@/logger';

const logger = createLogger('exampleModule.ts');

function exampleFunction() {
  logger.info('Function called successfully');
  try {
    // ...
  } catch (error) {
    logger.error(`An error occurred: ${error.message}`);
  }
}

exampleFunction();
```

#### Explanation

- **Prefix Customization**: Each logger instance can be created with a specific prefix (e.g., `exampleModule.ts`). This helps identify which module or part of the application generated the log, making debugging easier.
- **Timestamp Format**: The timestamp format is set to `YYYY-MM-DD HH:mm:ss` for better readability and consistency in logs.
- **Transports**: Logs are written to the console with colorization for easy reading during development and also saved to `logs/error.log` and `logs/combined.log` files for persistent storage and later analysis.
