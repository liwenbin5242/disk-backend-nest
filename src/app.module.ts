import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// 模块导入
import { UserModule } from './modules/user/user.module';
import { FilesModule } from './modules/files/files.module';

// 工具服务导入
import { LoggerService } from './utils/logger.service';
import { RedisService } from './utils/redis.service';
import { FileService } from './utils/file.service';
import { MailerService } from './utils/mailer.service';

// 中间件导入
import { RequestLoggerMiddleware } from './utils/request-logger.middleware';

// 策略导入
import { JwtStrategy } from './strategies/jwt.strategy';

// 控制器和服务
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // MongoDB连接
    MongooseModule.forRootAsync({
      useFactory: (configService: any) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    
    // 静态文件服务
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/',
    }),
    
    // 身份验证相关模块
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    
    // 业务模块
    UserModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    RedisService,
    FileService,
    MailerService,
    JwtStrategy,
  ],
  exports: [LoggerService, RedisService, FileService, MailerService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
