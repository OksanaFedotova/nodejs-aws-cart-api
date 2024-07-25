import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/models';
import { contentSecurityPolicy } from 'helmet';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

 async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (user && user.password === password) {
      return user;
    }

    return this.usersService.create({ username, password });
  }

  login(user: User, type: string) {
    const LOGIN_MAP = {
      jwt: () => this.loginJWT(user),
      basic: () => this.loginBasic(user),
      default: () => this.loginJWT(user),
    };
    const login = LOGIN_MAP[type];

    return login ? login() : LOGIN_MAP.default();
  }

  loginJWT(user: User) {
    const payload = { username: user.username, sub: user.id };

    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  loginBasic(user: User) {

    function encodeUserToken(user) {
      const { id, name, password } = user;
      const buf = Buffer.from([name, password].join(':'), 'utf8');

      return buf.toString('base64');
    }

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
