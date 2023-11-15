import { Injectable } from '@nestjs/common';
import { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AtCookieConfig implements CookieOptions {
  secure = false;
  domain = this.configService.get<string>('APP_DOMAIN');
  httpOnly = true;
  constructor(private configService: ConfigService) {}
}
