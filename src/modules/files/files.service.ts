import { Injectable, BadRequestException } from '@nestjs/common';
import { FileService as FileUtilsService } from '../../utils/file.service';
import { ConfigService } from '@nestjs/config';
import { UploadFileDto } from './dto/files.dto';

@Injectable()
export class FilesService {
  constructor(
    private fileUtilsService: FileUtilsService,
    private configService: ConfigService,
  ) {}

  /**
   * 上传文件
   * @param username 用户名
   * @param file 文件对象
   * @param uploadFileDto 上传参数
   */
  async uploadFile(
    username: string,
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<{
    url: string;
    path: string;
    name: string;
    ext: string;
  }> {
    try {
      const result = await this.fileUtilsService.saveUploadedFile(
        username,
        file,
        uploadFileDto.dir,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(`文件上传失败: ${error.message}`);
    }
  }

  /**
   * 删除文件
   * @param filePath 文件路径
   */
  async deleteFile(filePath: string): Promise<{ message: string; success: boolean }> {
    const result = await this.fileUtilsService.deleteFile(filePath);
    return {
      message: result ? '文件删除成功' : '文件删除失败或文件不存在',
      success: result,
    };
  }

  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   */
  fileExists(filePath: string): boolean {
    return this.fileUtilsService.fileExists(filePath);
  }
}