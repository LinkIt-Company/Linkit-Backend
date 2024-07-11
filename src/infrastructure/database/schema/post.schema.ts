import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { AIClassification } from './AIClassification.schema';
import { BaseDocument } from '@src/infrastructure/database/schema/base.schema';

@Schema({ collection: 'posts', timestamps: true, versionKey: false })
export class Post extends BaseDocument {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Folder' })
  folderId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ default: null, type: String })
  description: string | null;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({
    required: false,
    type: MongooseSchema.Types.ObjectId,
    ref: 'AIClassification',
  })
  aiClassificationId?: MongooseSchema.Types.ObjectId | AIClassification;
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);
