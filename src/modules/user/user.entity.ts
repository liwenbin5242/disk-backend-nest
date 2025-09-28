import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

// 用户等级枚举
export enum UserLevel {
  NORMAL = 1,  // 普通用户
  PERIOD_MEMBER = 2,  // 期限会员
  PERMANENT_MEMBER = 3,  // 永久会员
}

@Schema({
  timestamps: {
    createdAt: 'ctm',
    updatedAt: 'utm',
  },
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  pwd: string;  // 原始密码（注意：在实际应用中不应该存储明文密码）

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  name: string;

  @Prop({ default: '/imgs/avatar.jpg' })
  avatar: string;

  @Prop({ default: UserRole.MEMBER, enum: UserRole })
  role: UserRole;

  @Prop({ default: UserLevel.NORMAL, enum: UserLevel })
  level: UserLevel;

  @Prop({ default: 0 })
  coins: number;

  @Prop([String])
  banners: string[];

  @Prop()
  vx: string;

  @Prop({ default: () => new Date() })
  utm: Date;

  @Prop({ default: () => new Date() })
  ctm: Date;

  @Prop({ default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) })
  expires: Date;

  @Prop()
  code: string;
}

export const UserSchema = SchemaFactory.createForClass(User);