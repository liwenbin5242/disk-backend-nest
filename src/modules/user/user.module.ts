import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisService } from '../../utils/redis.service';
import { MailerService } from '../../utils/mailer.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, RedisService, MailerService],
  exports: [UserService],
})
export class UserModule {}