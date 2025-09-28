import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent');
    
    // 保存原始的 json 和 send 方法
    const originalJson = res.json;
    const originalSend = res.send;
    let responseData: any = null;
    
    // 重写 json 方法来捕获响应数据
    res.json = function(body) {
      responseData = body;
      return originalJson.call(this, body);
    };
    
    // 重写 send 方法来捕获响应数据
    res.send = function(body) {
      if (typeof body === 'object' || typeof body === 'string') {
        responseData = body;
      }
      return originalSend.call(this, body);
    };
    
    // 监听响应完成事件来记录日志
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      
      // 准备请求信息
      const requestInfo = {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent: userAgent || 'Unknown',
        headers: req.headers,
        query: req.query,
        body: req.body,
        response: responseData
      };
      
      // 只在开发环境或错误时记录详细信息
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isError = res.statusCode >= 400;
      
      if (isDevelopment || isError) {
        this.loggerService.log(
          `Request: ${JSON.stringify(requestInfo, null, 2)}`,
          'RequestLogger'
        );
      } else {
        // 生产环境只记录基本信息
        const basicInfo = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${responseTime}ms`;
        this.loggerService.log(basicInfo, 'RequestLogger');
      }
    });
    
    next();
  }
}