import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from '../types';
import { Response } from 'express';
import { RtGuard } from './guards';
import { User, Public } from './decorators';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('/local/signup')
  async signupLocal(
    @Body() dto: AuthDto,
    @Res() res: Response,
  ): Promise<Tokens> {
    return this.authService.signUpLocal(dto, res);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/local/login')
  async login(@Body() dto: AuthDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async logout(@User('sub') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refreshTokens(
    @Req() req: Request,
    @User('refreshToken') refreshToken: string,
    @User('sub') userId: string,
    @Res() res: Response,
  ) {
    console.log(req.user);
    return this.authService.refreshTokens(userId, refreshToken, res);
  }
}
