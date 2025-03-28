import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { BaseDocument } from './base.schema';

@Schema({
  collection: 'ai_classifications',
  timestamps: true,
  versionKey: false,
})
export class AIClassification extends BaseDocument {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Folder' })
  suggestedFolderId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [String] })
  keywords: string[];

  @Prop({ type: Date })
  completedAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export type AIClassificationDocument = HydratedDocument<AIClassification>;
export const AIClassificationSchema =
  SchemaFactory.createForClass(AIClassification);
