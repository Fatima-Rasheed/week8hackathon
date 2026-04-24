import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const doc = await this.documentsService.uploadAndExtract(file);
    return { success: true, documentId: doc._id, filename: doc.originalName };
  }

  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doc = await this.documentsService.findById(id);
    return {
      _id: doc._id,
      filename: doc.originalName,
      documentType: doc.documentType,
      sections: doc.sections,
      themes: doc.themes,
      entities: doc.entities,
      analyzed: doc.analyzed,
      createdAt: (doc as any).createdAt,
    };
  }
}
