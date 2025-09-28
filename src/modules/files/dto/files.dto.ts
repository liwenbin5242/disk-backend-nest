import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

// 文件上传DTO
export class UploadFileDto {
  @IsOptional()
  @IsString()
  dir?: string;
}

// 文件删除DTO
export class DeleteFileDto {
  @IsNotEmpty({ message: '文件路径不能为空' })
  @IsString()
  filePath: string;
}