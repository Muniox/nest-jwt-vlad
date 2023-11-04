import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto';
import { User } from '../entity/user.entity';
import { hashData } from '../utlis/hash-helper';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  async signUpLocal(dto: AuthDto) {
    const newUser = new User();
    newUser.email = dto.email;
    newUser.hash = await hashData(dto.password);
    await newUser.save();
  }
  async signInLocal() {}

  async logout() {}

  async refreshTokens() {}

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
}
