import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          return req && req.cookies ? req.cookies?.Authorization ?? null : null;
        },
      ]),
      secretOrKey: 'at-secret',
    });
  }

  validate(payload: any) {
    return payload;
  }
}
