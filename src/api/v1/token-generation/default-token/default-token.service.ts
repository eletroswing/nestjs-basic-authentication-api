import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class DefaultTokenService {
  generate() {
    const token =
      v4() +
      '-' +
      v4() +
      '-' +
      v4() +
      '-' +
      v4() +
      '-' +
      v4() +
      '-' +
      v4() +
      '-' +
      v4();
    return token;
  }
}
