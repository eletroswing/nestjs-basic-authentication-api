import { Controller, Get } from '@nestjs/common';

@Controller('authenticated-route')
export class AuthenticatedRouteController {
  @Get()
  async handle() {
    return 'you are autenticated';
  }
}
