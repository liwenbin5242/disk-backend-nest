import { Controller, Post, Delete, UploadedFile, UseInterceptors, Query, Body, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { UploadFileDto, DeleteFileDto } from './dto/files.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ReturnCodes } from '../../utils/return-codes';

@Controller('api/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {
    
  }

  /**
   * 上传文件
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Query() uploadFileDto: UploadFileDto,
  ) {
    const result = await this.filesService.uploadFile(
      req.user.username,
      file,
      uploadFileDto,
    );
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }

  /**
   * 删除文件
   */
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
async deleteFile(@Body() deleteFileDto: DeleteFileDto) {
    const result = await this.filesService.deleteFile(deleteFileDto.filePath);
    return {
      code: ReturnCodes.SUCCESS,
      data: result,
      message: 'ok',
    };
  }
}