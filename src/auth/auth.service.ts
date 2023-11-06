import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { User } from '../entity/user.entity';
import { hashData } from '../utlis/hash-helper';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../types';
import { Response } from 'express';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async signUpLocal(dto: AuthDto, res: Response): Promise<any> {
    const user = await User.findOne({ where: { email: dto.email } });

    if (user) {
      throw new ForbiddenException('User already exists');
    }

    const newUser = new User();
    newUser.email = dto.email;
    newUser.hash = await hashData(dto.password);
    await newUser.save();

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refresh_token);

    return res
      .cookie('Refresh', tokens.refresh_token, {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
        path: '/auth/refresh',
      })
      .cookie('Authorization', tokens.access_token, {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
      })
      .json({ ok: true });
  }

  async login(dto: AuthDto, res: Response) {
    const user = await User.findOne({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordMatches = await argon2.verify(user.hash, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    // powtarzanie kodu
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return res
      .cookie('Refresh', tokens.refresh_token, {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
        path: '/auth/refresh',
      })
      .cookie('Authorization', tokens.access_token, {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
      })
      .json({ ok: true });
  }

  async logout(userId: number) {
    await User.update(
      { id: userId, hashedRT: Not(IsNull()) },
      { hashedRT: null },
    );
  }

  async refreshTokens(userId: number, rt: string | null, res: Response) {
    const user = await User.findOne({ where: { id: userId } });

    if (!user || !user.hashedRT) throw new UnauthorizedException();

    const rtMatches = await argon2.verify(user.hashedRT, rt);
    if (!rtMatches) throw new UnauthorizedException();

    // powtarzanie kodu
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return res
      .cookie('Refresh', tokens.refresh_token, {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
        path: '/auth/refresh',
      })
      .cookie('Authorization', tokens.access_token, {
        secure: false,
        domain: 'localhost',
        httpOnly: true,
      })
      .json({ ok: true });
  }

  async validateUser(email: string, password: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await argon2.verify(user.hash, password))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    // TODO: lepsze niż promise all
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'at-secret',
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'rt-secret',
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await hashData(rt);
    await User.update({ id: userId }, { hashedRT: hash });
  }
}
