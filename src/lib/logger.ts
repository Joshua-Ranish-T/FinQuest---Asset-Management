// Centralized Logger & Diagnostics

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, error?: unknown, context?: LogContext) {
    const errDetails = error instanceof Error ? { error: error.message, stack: error.stack } : { rawError: error };
    console.error(this.format('error', message, { ...context, ...errDetails }));
  }
}

export const logger = new Logger();
