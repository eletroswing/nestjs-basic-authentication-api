import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HomeController {
    @Get()
    handle() {
      return {message: 'api-online'} 
    }
}
