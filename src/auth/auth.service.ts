import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/models';
import { UserNotFoundException, InvalidPasswordException } from './exceptions'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new UserNotFoundException(username); 
    }

    if (user.password !== password) {
      throw new InvalidPasswordException(); 
    }

    return user;
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
      const { username, password } = user; // Используйте username вместо name
      const buf = Buffer.from([username, password].join(':'), 'utf8');

      return buf.toString('base64');
    }

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
