import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.entity';
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto';
import { RedisService } from '../../utils/redis.service';
import { MailerService } from '../../utils/mailer.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private redisService: RedisService,
    private mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 生成随机验证码
   */
  private generateVerificationCode(): string {
    return Math.random().toString().slice(-6);
  }

  /**
   * 发送注册验证码
   * @param email 邮箱地址
   */
  async sendVerificationCode(email: string): Promise<{ message: string }> {
    const code = this.generateVerificationCode();
    
    // 存储验证码到Redis，有效期5分钟
    await this.redisService.set(email, code, 5 * 60);
    
    // 发送验证码邮件
    try {
      await this.mailerService.sendVerificationCode(email, code);
    } catch (error) {
      throw new UnauthorizedException('发送验证码失败，请稍后重试');
    }
    
    return { message: '验证码已发送' };
  }

  /**
   * 验证邮箱验证码
   * @param email 邮箱地址
   * @param code 验证码
   */
  private async verifyCode(email: string, code: string): Promise<boolean> {
    const storedCode = await this.redisService.get(email);
    return storedCode === code;
  }

  /**
   * 用户注册
   * @param registerUserDto 注册信息
   */
  async register(registerUserDto: RegisterUserDto): Promise<{ message: string }> {
    const { username, password, email, code } = registerUserDto;
    
    // 检查用户是否已存在
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('用户已存在');
    }
    
    // 如果提供了邮箱和验证码，则验证
    if (email && code) {
      const isCodeValid = await this.verifyCode(email, code);
      if (!isCodeValid) {
        throw new UnauthorizedException('验证码不正确或已过期');
      }
    }
    
    // 加密密码
    const hashedPassword = await argon2.hash(password);
    
    // 创建新用户
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      pwd: password, // 注意：在实际生产环境中不应该存储明文密码
      email,
      code: uuidv4().slice(-6),
      avatar: `${this.configService.get('APP_URL')}/imgs/avatar.jpg`,
    });
    
    await newUser.save();
    
    return { message: '注册成功' };
  }

  /**
   * 用户登录
   * @param loginUserDto 登录信息
   */
  async login(loginUserDto: LoginUserDto): Promise<{ token: string; username: string; userId: string }> {
    const { username, password } = loginUserDto;
    
    // 查找用户
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }
    
    // 验证密码
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }
    
    // 检查账号是否过期
    if (user.expires <= new Date()) {
      throw new UnauthorizedException('账号已过期，请联系管理员续期');
    }
    
    // 生成JWT令牌
    const payload = { username: user.username, sub: user._id };
    const token = this.jwtService.sign(payload);
    
    return {
      token,
      username: user.username,
      userId: (user._id as any).toString(),
    };
  }

  /**
   * 获取用户信息
   * @param username 用户名
   */
  async getUserInfo(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).select('-password -pwd');
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 更新用户信息
   * @param username 用户名
   * @param updateUserDto 更新信息
   */
  async updateUserInfo(username: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { username },
      { $set: updateUserDto },
      { new: true }
    ).select('-password -pwd');
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    
    return user;
  }

  /**
   * 登出（实际项目中可能需要在Redis中存储token黑名单）
   */
  async logout(): Promise<{ message: string }> {
    // 在实际项目中，这里可能需要将token加入黑名单
    return { message: '登出成功' };
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }
}