import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, ReqUserPayload } from '@src/common/types/type';
import { User } from '@src/infrastructure';
import { JWT_STRATEGY_TOKEN } from './strategy.token';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  JWT_STRATEGY_TOKEN,
) {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly config: ConfigService,
  ) {
    super({
      secretOrKey: config.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<ReqUserPayload> {
    const user = await this.userModel.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('인증에 실패하였습니다.');
    }
    return {
      id: payload.id,
    };
  }
}
