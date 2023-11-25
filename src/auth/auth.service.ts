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
import { CookieNames, Tokens } from '../types';
import { Response } from 'express';
import { IsNull, Not } from 'typeorm';
import { AtCookieConfig, RtCookieConfig } from '../config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private rtCookieConfig: RtCookieConfig,
    private atCookieConfig: AtCookieConfig,
  ) {}

  private readonly jwtSecretActivationToken = this.configService.get<string>(
    'JWT_SECRET_ACCESS_TOKEN',
  );

  private readonly jwtExpirationTimeActivationToken =
    this.configService.get<string>('JWT_EXPIRATION_TIME_ACCESS_TOKEN');

  private readonly jwtSecretRefreshToken = this.configService.get<string>(
    'JWT_SECRET_REFRESH_TOKEN',
  );
  private readonly jwtExpirationTimeRefreshToken =
    this.configService.get<string>('JWT_EXPIRATION_TIME_REFRESH_TOKEN');

  async register(dto: AuthDto, res: Response): Promise<any> {
    const user = await User.findOne({ where: { email: dto.email } });

    if (user) {
      throw new ForbiddenException('User already exists');
    }

    const newUser = new User();
    newUser.email = dto.email;
    newUser.hash = await hashData(dto.password);
    await newUser.save();

    const tokens = await this.getAndUpdateTokens(newUser);

    return res
      .cookie(CookieNames.REFRESH, tokens.refreshToken, this.rtCookieConfig)
      .cookie(CookieNames.ACCESS, tokens.accessToken, this.atCookieConfig)
      .json({ ok: true });
  }

  async login(dto: AuthDto, res: Response) {
    // TODO: user powinien być zwracany z req
    const user = await User.findOne({ where: { email: dto.email } });
    //
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    //
    // const passwordMatches = await argon2.verify(user.hash, dto.password);
    //
    // if (!passwordMatches) {
    //   throw new UnauthorizedException();
    // }

    const tokens = await this.getAndUpdateTokens(user);

    return res
      .cookie(CookieNames.REFRESH, tokens.refreshToken, this.rtCookieConfig)
      .cookie(CookieNames.ACCESS, tokens.accessToken, this.atCookieConfig)
      .json({ ok: true });
  }

  async logout(userId: string, res: Response) {
    await User.update(
      { id: userId, hashedRT: Not(IsNull()) },
      { hashedRT: null },
    );

    return res
      .clearCookie(CookieNames.ACCESS)
      .clearCookie(CookieNames.REFRESH)
      .json({ message: 'ok' });
  }

  async refreshTokens(userId: string, rt: string | null, res: Response) {
    const user = await User.findOne({ where: { id: userId } });

    if (!user || !user.hashedRT) throw new UnauthorizedException();

    const rtMatches = await argon2.verify(user.hashedRT, rt);
    if (!rtMatches) throw new UnauthorizedException();

    const tokens = await this.getAndUpdateTokens(user);

    return res
      .cookie(CookieNames.REFRESH, tokens.refreshToken, this.rtCookieConfig)
      .cookie(CookieNames.ACCESS, tokens.accessToken, this.atCookieConfig)
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

  private async getAndUpdateTokens(user: User) {
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const payload = { sub: userId, email };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecretActivationToken,
        expiresIn: this.jwtExpirationTimeActivationToken,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecretRefreshToken,
        expiresIn: this.jwtExpirationTimeRefreshToken,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  private async updateRtHash(userId: string, rt: string) {
    const hashRT = await hashData(rt);
    await User.update({ id: userId }, { hashedRT: hashRT });
  }
}
