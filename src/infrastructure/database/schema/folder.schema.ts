import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { FolderType } from '@src/infrastructure/database/types/folder-type.enum';
import { BaseDocument } from './base.schema';

@Schema({ collection: 'folders', timestamps: true, versionKey: false })
export class Folder extends BaseDocument {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: FolderType, type: String })
  type: FolderType;

  @Prop({ required: true, default: true })
  visible: boolean;
}

export type FolderDocument = HydratedDocument<Folder>;
export const FolderSchema = SchemaFactory.createForClass(Folder);
