import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PdfDocument, DocumentDocument } from './schemas/document.schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFParser = require('pdf2json');

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(PdfDocument.name) private docModel: Model<DocumentDocument>,
  ) {}

  async uploadAndExtract(file: Express.Multer.File): Promise<DocumentDocument> {
    const extractedText = await this.extractText(file.buffer);

    const doc = new this.docModel({
      filename: file.originalname,
      originalName: file.originalname,
      extractedText,
      analyzed: false,
    });

    return doc.save();
  }

private extractText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on('pdfParser_dataReady', (data: any) => {
      const text = data.Pages?.map((page: any) =>
        page.Texts?.map((t: any) =>
          t.R?.map((r: any) => {
            try {
              return decodeURIComponent(r.T);
            } catch {
              return r.T; // return raw if decoding fails
            }
          }).join('')
        ).join(' ')
      ).join('\n') || '';
      resolve(text.trim());
    });

    parser.on('pdfParser_dataError', (err: any) => {
      reject(new Error(err.parserError));
    });

    parser.parseBuffer(buffer);
  });
}
  async findById(id: string): Promise<DocumentDocument> {
    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async findAll(): Promise<DocumentDocument[]> {
    return this.docModel.find().select('-extractedText').sort({ createdAt: -1 }).exec();
  }

  async updateAnalysis(
    id: string,
    data: {
      documentType: string;
      sections: string[];
      themes: string[];
      entities: string[];
      analysisResult: string;
    },
  ): Promise<DocumentDocument> {
    const doc = await this.docModel
      .findByIdAndUpdate(id, { ...data, analyzed: true }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }
}