import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggerService } from './utils/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注入自定义日志服务
  const logger = app.get(LoggerService);

  // 使用自定义日志服务
  app.useLogger(logger);
  
  // 配置CORS
  app.enableCors({
    origin: '*', // 实际项目中应限制为允许的域名
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // 全局管道：数据验证和转换
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 自动删除非白名单属性
    transform: true, // 自动转换请求数据类型
    forbidNonWhitelisted: true, // 当存在非白名单属性时抛出错误
  }));
  
  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  
  // 健康检查接口
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'disk-backend-nest',
      version: '1.0.0',
    });
  });
  
  // 启动服务器
  const port = 3000;
  await app.listen(port);
  
  logger.log(`应用已启动，监听端口: ${port}`);
}
bootstrap();
