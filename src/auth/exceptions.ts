import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(username: string) {
    super(`User with username '${username}' not found.`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidPasswordException extends HttpException {
  constructor() {
    super('Invalid password.', HttpStatus.UNAUTHORIZED);
  }
}
