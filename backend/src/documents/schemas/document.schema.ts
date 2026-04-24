import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentDocument = PdfDocument & Document;

@Schema({ timestamps: true })
export class PdfDocument {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  extractedText: string;

  @Prop()
  documentType: string;

  @Prop({ type: [String], default: [] })
  sections: string[];

  @Prop({ type: [String], default: [] })
  themes: string[];

  @Prop({ type: [String], default: [] })
  entities: string[];

  @Prop()
  analysisResult: string;

  @Prop({ default: false })
  analyzed: boolean;
}

export const PdfDocumentSchema = SchemaFactory.createForClass(PdfDocument);
