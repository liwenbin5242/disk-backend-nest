import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto, LoginUserDto, UpdateUserDto, SendVerificationCodeDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ReturnCodes } from '../../utils/return-codes';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 发送注册验证码
   */
  @Get('regcode')
async sendVerificationCode(@Body() sendVerificationCodeDto: SendVerificationCodeDto) {
    const result = await this.userService.sendVerificationCode(sendVerificationCodeDto.email);
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }

  /**
   * 用户注册
   */
  @Post('register')
async register(@Body() registerUserDto: RegisterUserDto) {
    const result = await this.userService.register(registerUserDto);
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }

  /**
   * 用户登录
   */
  @Post('login')
async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.userService.login(loginUserDto);
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }

  /**
   * 用户登出
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
async logout() {
    const result = await this.userService.logout();
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }

  /**
   * 获取用户信息
   */
  @Get('info')
  @UseGuards(JwtAuthGuard)
async getUserInfo(@Request() req) {
    const result = await this.userService.getUserInfo(req.user.username);
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }

  /**
   * 更新用户信息
   */
  @Put('info')
  @UseGuards(JwtAuthGuard)
async updateUserInfo(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.updateUserInfo(req.user.username, updateUserDto);
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }
}