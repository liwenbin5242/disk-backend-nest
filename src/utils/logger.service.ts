import { Injectable, Logger, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly logDir = 'logs';
  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    // 生产环境下创建日志目录
    if (this.isProduction) {
      this.ensureLogDirectory();
    }
  }

  private ensureLogDirectory() {
    const logPath = path.join(process.cwd(), this.logDir);
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}] ` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${prefix}${message}`;
  }

  private writeToFile(level: string, message: string, trace?: string) {
    if (!this.isProduction) return;

    const timestamp = new Date();
    const dateStr = timestamp.toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${dateStr}.log`);
    
    const logMessage = this.formatMessage(level, message) + '\n';
    const traceMessage = trace ? `${trace}\n` : '';
    
    try {
      fs.appendFileSync(logFile, logMessage + traceMessage);
    } catch (error) {
      console.error('写入日志文件失败:', error);
    }
  }

  log(message: string, context?: string) {
    const formattedMessage = this.formatMessage('LOG', message, context);
    
    if (this.isProduction) {
      this.writeToFile('LOG', message, undefined);
    } else {
      console.log(formattedMessage);
    }
  }

  error(message: string, trace?: string, context?: string) {
    const formattedMessage = this.formatMessage('ERROR', message, context);
    
    if (this.isProduction) {
      this.writeToFile('ERROR', message, trace);
    } else {
      console.error(formattedMessage);
      if (trace) {
        console.error(trace);
      }
    }
  }

  warn(message: string, context?: string) {
    const formattedMessage = this.formatMessage('WARN', message, context);
    
    if (this.isProduction) {
      this.writeToFile('WARN', message, undefined);
    } else {
      console.warn(formattedMessage);
    }
  }

  debug(message: string, context?: string) {
    const formattedMessage = this.formatMessage('DEBUG', message, context);
    
    if (this.isProduction) {
      this.writeToFile('DEBUG', message, undefined);
    } else {
      console.debug(formattedMessage);
    }
  }

  verbose(message: string, context?: string) {
    const formattedMessage = this.formatMessage('VERBOSE', message, context);
    
    if (this.isProduction) {
      this.writeToFile('VERBOSE', message, undefined);
    } else {
      console.log(formattedMessage);
    }
  }

  // 请求日志方法
  logRequest(method: string, url: string, statusCode: number, responseTime: number, ip?: string, userAgent?: string) {
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;
    const context = ip ? `${ip} - ${userAgent || 'Unknown'}` : undefined;
    
    const formattedMessage = this.formatMessage('REQUEST', message, context);
    
    if (this.isProduction) {
      this.writeToFile('REQUEST', message, undefined);
    } else {
      console.log(formattedMessage);
    }
  }
}