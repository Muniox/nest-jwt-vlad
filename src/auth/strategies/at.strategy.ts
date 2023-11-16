import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieNames } from '../../types';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          return req && req.cookies
            ? req.cookies?.[CookieNames.ACCESS] ?? null
            : null;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET_ACCESS_TOKEN'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
