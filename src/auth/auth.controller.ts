import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from '../types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/local/signup')
  async signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signUpLocal(dto);
  }

  @Post('/local/signup')
  async signinLocal() {
    return this.authService.signInLocal();
  }

  @Post('/logout')
  async logout() {
    return this.authService.logout();
  }

  @Post('/refresh')
  async refreshTokens() {
    return this.authService.refreshTokens();
  }
}
