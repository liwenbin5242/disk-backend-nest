import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private uploadDir: string;
  private staticDir: string;

  constructor(private configService: ConfigService) {
    // 设置文件存储路径
    this.staticDir = path.join(process.cwd(), 'static');
    this.uploadDir = path.join(this.staticDir, 'upload');
    
    // 确保静态目录存在
    this.ensureDirExists(this.staticDir);
    this.ensureDirExists(this.uploadDir);
  }

  /**
   * 确保目录存在
   * @param dir 目录路径
   */
  private ensureDirExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 为用户创建上传目录
   * @param username 用户名
   * @param subDir 子目录
   */
  createUserUploadDir(username: string, subDir?: string): string {
    let userUploadDir = path.join(this.uploadDir, username);
    if (subDir) {
      userUploadDir = path.join(userUploadDir, subDir);
    }
    
    this.ensureDirExists(userUploadDir);
    return userUploadDir;
  }

  /**
   * 生成文件URL
   * @param username 用户名
   * @param subDir 子目录
   * @param filename 文件名
   */
  generateFileUrl(username: string, filename: string, subDir?: string): string {
    let url = `/upload/${username}/${filename}`;
    if (subDir) {
      url = `/upload/${username}/${subDir}/${filename}`;
    }
    return url;
  }

  /**
   * 保存上传的文件
   * @param username 用户名
   * @param file 文件对象
   * @param subDir 子目录
   */
  async saveUploadedFile(
    username: string,
    file: Express.Multer.File,
    subDir?: string,
  ): Promise<{
    url: string;
    path: string;
    name: string;
    ext: string;
  }> {
    if (!file) {
      throw new BadRequestException('没有文件被上传');
    }

    try {
      // 创建用户上传目录
      const userUploadDir = this.createUserUploadDir(username, subDir);
      
      // 生成新的文件名（原文件名+随机数）
      const extname = path.extname(file.originalname);
      const basename = path.basename(file.originalname, extname);
      const randomNumber = Math.floor(Math.random() * 8999 + 10000);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newFilename = `${basename}-${timestamp}-${randomNumber}${extname}`;
      
      // 保存文件
      const filePath = path.join(userUploadDir, newFilename);
      fs.writeFileSync(filePath, file.buffer);
      
      // 生成文件URL
      const fileUrl = this.generateFileUrl(username, newFilename, subDir);
      
      return {
        url: fileUrl,
        path: filePath,
        name: file.originalname,
        ext: extname,
      };
    } catch (error) {
      throw new BadRequestException(`文件保存失败: ${error.message}`);
    }
  }

  /**
   * 删除文件
   * @param filePath 文件路径
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * 读取文件内容
   * @param filePath 文件路径
   */
  readFile(filePath: string): Buffer {
    return fs.readFileSync(filePath);
  }
}