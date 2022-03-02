import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JwtModule } from '@nestjs/jwt';

//controllers
import { HomeController } from './home/home.controller';
import { SignupController } from './signup/signup.controller';
import { SignupConfirmationController } from './signup-confirmation/signup-confirmation.controller';
import { SigninController } from './signin/signin.controller';

//providers(services)
import { PrismaService } from '../../prisma.service';
import { RefreshTokenService } from './token-generation/refresh-token/refresh-token.service';
import { JwttokenService } from './token-generation/jwttoken/jwttoken.service';
import { SendMailProducerService } from '../../jobs/sendmail/sendmail-producer-service';
import { DefaultTokenService } from './token-generation/default-token/default-token.service';

//midules
import { MailerModule } from '@nestjs-modules/mailer';

//consumers
import { SendMailConsumer } from '../../jobs/sendmail/sendmail-consumer';

//middlewares
import { SignUpMiddleware } from './middlewares/signup.middleware';
import { RegenerateRefreshTokenController } from './regenerate-refresh-token/regenerate-refresh-token.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_JWT,
      signOptions: { expiresIn: '60s' },
    }),
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
        password: process.env.REDIS_PASS
      },
    }),
    BullModule.registerQueue({
      name: 'sendmail-queue',
    }),
  ],
  controllers: [HomeController, SignupController, SignupConfirmationController, SigninController, RegenerateRefreshTokenController],
  providers: [PrismaService, SendMailProducerService, SendMailConsumer, RefreshTokenService, JwttokenService, DefaultTokenService],
})

export class V1Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SignUpMiddleware)
      .forRoutes({path: '/api/v1/signup', method: RequestMethod.POST});
  }
}
