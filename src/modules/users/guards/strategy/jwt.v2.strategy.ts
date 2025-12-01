import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import { JwtPayload, ReqUserPayload } from '@src/common/types/type';
import { User } from '@src/infrastructure/database/entities/user.entity';
import { JWT_V2_STRATEGY_TOKEN } from './strategy.token';

@Injectable()
export class JwtV2Strategy extends PassportStrategy(
  Strategy,
  JWT_V2_STRATEGY_TOKEN,
) {
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    super({
      secretOrKey: config.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<ReqUserPayload> {
    const user = await this.dataSource.manager.findOne(User, {
      where: {
        id: payload.id,
      },
    });
    if (!user) {
      throw new UnauthorizedException('인증에 실패하였습니다.');
    }
    return {
      id: payload.id,
    };
  }
}
