import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

//services

//modules
import { V1Module } from './api/v1/v1.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [V1Module, 
    ConfigModule.forRoot(),
    RouterModule.register([
    {
      path: 'api',
      module: ApiModule,
      children: [
        {
          path: 'v1',
          module: V1Module,
        },
      ],
    },
  ])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
