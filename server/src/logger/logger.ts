import { basename } from 'path';
import { createLogger, format, type Logger, transports } from 'winston';
const { combine, timestamp, printf, colorize } = format;

const customTimestampFormat = 'YYYY-MM-DD HH:mm:ss';

const getCallerFile = (): string => {
  const stack = new Error().stack;
  if (stack == null) return 'unknown';
  // The caller's file will be on the second line of the stack trace
  const callerFile = stack.split('\n')[3]?.trim();
  if (callerFile.length === 0) return 'unknown';
  const match = callerFile.match(/\((.*):\d+:\d+\)/);
  return match != null ? basename(match[1]) : 'unknown';
};

const customFormat = (prefix: string): ReturnType<typeof printf> =>
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}] [${prefix}]: ${message}`;
  });

const createCustomLogger = (prefix?: string): Logger => {
  const loggerPrefix = prefix ?? getCallerFile();

  return createLogger({
    level: 'info',
    format: combine(
      timestamp({ format: customTimestampFormat }),
      customFormat(loggerPrefix)
    ),
    transports: [
      new transports.Console({
        format: combine(
          colorize(),
          timestamp({ format: customTimestampFormat }),
          customFormat(loggerPrefix)
        ),
      }),
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ],
  });
};

export { createCustomLogger as createLogger };
