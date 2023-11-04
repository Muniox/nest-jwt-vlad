import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          return req && req.cookies ? req.cookies?.Refresh ?? null : null;
        },
      ]),
      secretOrKey: 'at-secret',
      passReqToCallback: true,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
