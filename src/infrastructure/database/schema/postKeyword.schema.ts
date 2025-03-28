import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'post_keywords', versionKey: false })
export class PostKeyword {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Post' })
  postId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Keyword' })
  keywordId: MongooseSchema.Types.ObjectId;
}

export type PostKeywordDocument = HydratedDocument<PostKeyword>;
export const PostKeywordSchema = SchemaFactory.createForClass(PostKeyword);
