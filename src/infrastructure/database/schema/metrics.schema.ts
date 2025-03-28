import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseDocument } from './base.schema';

@Schema({ collection: 'metrics', timestamps: true, versionKey: false })
export class Metrics extends BaseDocument {
  @Prop({ required: true })
  isSuccess: boolean;

  @Prop({ required: true })
  time: number;

  @Prop({ required: true })
  postURL: string;

  @Prop({ required: true })
  postId: string; // 굳이 연관관계를 가져야하는 필드는 아니므로 string 처리
}

export type MetricsDocument = HydratedDocument<Metrics>;
export const MetricsSchema = SchemaFactory.createForClass(Metrics);
