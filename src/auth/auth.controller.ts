import { Controller, Post, Body, Headers, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/services/users.service';
import { CreateUserDto } from 'src/users/dto';
//import { User } from '../users/models'; 

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService, // Если нужно использовать UsersService
  ) {}

  @Post('login')
  async login(
    @Body() body: CreateUserDto,
    @Headers('authorization-type') authType: string
  ) {
    const { username, password } = body;
    const type = authType || 'jwt'; 
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const { token_type, access_token } = this.authService.login(user, type);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: {
        token_type,
        access_token,
      },
    };
  }
}


