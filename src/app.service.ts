import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  IsApiOnline() {
    return { message: 'online' };
  }
}
