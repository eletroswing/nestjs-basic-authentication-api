import { Controller, Get } from '@nestjs/common';

@Controller('api/v1/')
export class ApiController {
    @Get()
    DefaultRoute(){
        return {message: 'api-online'}
    }
}
