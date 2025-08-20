type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
}

const originalConsole = globalThis.console;

class LoggerProxy {
  private static instance: LoggerProxy;
  private enabled = true;
  private logLevel: LogLevel = 'info';

  private constructor() {}

  static getInstance(): LoggerProxy {
    if (!LoggerProxy.instance) {
      LoggerProxy.instance = new LoggerProxy();
    }
    return LoggerProxy.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
    };
  }

  private output(entry: LogEntry): void {
    const { level, message, data, timestamp } = entry;
    const timeStr = timestamp.toISOString();

    const logMessage = data
      ? `[${timeStr}] [${level.toUpperCase()}] ${message}`
      : `[${timeStr}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'debug':
      // originalConsole.debug(logMessage, data || '');
      // break;
      case 'info':
      // originalConsole.info(logMessage, data || '');
      // break;
      case 'warn':
      // originalConsole.warn(logMessage, data || '');
      // break;
      case 'error':
        originalConsole.error(logMessage, data || '');
        break;
    }
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.formatMessage('debug', message, data);
    this.output(entry);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    const entry = this.formatMessage('info', message, data);
    this.output(entry);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    const entry = this.formatMessage('warn', message, data);
    this.output(entry);
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog('error')) return;
    const entry = this.formatMessage('error', message, data);
    this.output(entry);
  }

  log(message: string, data?: any): void {
    this.info(message, data);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

const logger = LoggerProxy.getInstance();

const console = {
  log: (message: string, ...args: any[]) =>
    logger.log(message, args.length > 0 ? args : undefined),
  info: (message: string, ...args: any[]) =>
    logger.info(message, args.length > 0 ? args : undefined),
  warn: (message: string, ...args: any[]) =>
    logger.warn(message, args.length > 0 ? args : undefined),
  error: (message: string, ...args: any[]) =>
    logger.error(message, args.length > 0 ? args : undefined),
  debug: (message: string, ...args: any[]) =>
    logger.debug(message, args.length > 0 ? args : undefined),
};

export { logger, console };
export default logger;
