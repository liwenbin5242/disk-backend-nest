import { IsNotEmpty, IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

// 用户注册DTO
export class RegisterUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString()
  code?: string;
}

// 用户登录DTO
export class LoginUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  password: string;
}

// 用户信息更新DTO
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  vx?: string;
}

// 发送验证码DTO
export class SendVerificationCodeDto {
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;
}