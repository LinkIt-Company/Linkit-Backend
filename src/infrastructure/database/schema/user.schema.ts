import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  deviceToken: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
