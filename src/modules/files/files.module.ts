import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileService as FileUtilsService } from '../../utils/file.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.register({
      // 这里可以配置文件上传的临时存储位置等
      // dest: './uploads/tmp',
    }),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, FileUtilsService],
  exports: [FilesService],
})
export class FilesModule {}