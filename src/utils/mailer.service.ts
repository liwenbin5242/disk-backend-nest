import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // 配置邮件发送器
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_PORT') === 465,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  /**
   * 发送邮件验证码
   * @param email 接收邮箱
   * @param code 验证码
   */
  async sendVerificationCode(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_USER'),
        to: email,
        subject: '注册验证码',
        text: `您的验证码是：${code}，有效期5分钟。`,
        html: `<p>您的验证码是：<strong>${code}</strong>，有效期5分钟。</p>`,
      });
    } catch (error) {
      throw new InternalServerErrorException('发送验证码失败');
    }
  }

  /**
   * 发送通用邮件
   * @param email 接收邮箱
   * @param subject 主题
   * @param content 内容
   */
  async sendMail(email: string, subject: string, content: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_USER'),
        to: email,
        subject,
        text: content,
        html: content,
      });
    } catch (error) {
      throw new InternalServerErrorException('发送邮件失败');
    }
  }
}