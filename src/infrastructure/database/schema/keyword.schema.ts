import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'keywords', versionKey: false })
export class Keyword {
  @Prop({ required: true })
  name: string;
}

export type KeywordDocument = Keyword & Document;
export const KeywordSchema = SchemaFactory.createForClass(Keyword);
