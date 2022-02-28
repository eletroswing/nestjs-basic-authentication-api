import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

//controllers
import { HomeController } from './home/home.controller';
import { SignupController } from './signup/signup.controller';

//providers(services)
import { PrismaService } from '../../prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';

import { SendMailConsumer } from '../../jobs/sendmail/sendmail-consumer';
import { SendMailProducerService } from '../../jobs/sendmail/sendmail-producer-service';
import { SignUpMiddleware } from './middlewares/signup.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'sendmail-queue',
    }),
  ],
  controllers: [HomeController, SignupController],
  providers: [PrismaService, SendMailProducerService, SendMailConsumer],
})

export class V1Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SignUpMiddleware)
      .forRoutes('/api/v1/signup');
  }
}
