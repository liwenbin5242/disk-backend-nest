import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../utils/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // 默认状态码为500
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = status;
    
    // 处理HTTP异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      
      // 处理NestJS内置异常的响应格式
      if (typeof responseBody === 'object') {
        message = (responseBody as any).message || exception.message;
        errorCode = (responseBody as any).errorCode || status;
      } else {
        message = responseBody as string;
      }
    } else {
      // 处理非HTTP异常
      message = exception.message || 'Internal server error';
      this.logger.error(`Unexpected error: ${message}`, exception.stack);
    }
    
    // 记录请求信息和错误
    this.logger.error(`Request: ${request.method} ${request.path}`, message);
    
    // 统一返回格式
    response.status(status).json({
      code: errorCode,
      message: message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}