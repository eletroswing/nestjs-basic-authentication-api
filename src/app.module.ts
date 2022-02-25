import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaService } from './prisma.service';
import { ApiController } from './api/api.controller';

@Module({
  imports: [],
  controllers: [AppController, ApiController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
