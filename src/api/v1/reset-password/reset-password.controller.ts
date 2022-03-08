import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import * as dayjs from 'dayjs';
import { ResetPasswordDTO } from './reset-password-dto';
import { DefaultTokenService } from '../token-generation/default-token/default-token.service';
import { SendMailProducerService } from 'src/jobs/sendmail/sendmail-producer-service';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private prisma: PrismaService,
    private defaultToken: DefaultTokenService,
    private sendMailService: SendMailProducerService,
  ) {}

  generateRandomNDigits(n: number) {
    return Math.floor(Math.random() * (9 * Math.pow(10, n))) + Math.pow(10, n);
  }

  @Post()
  async handle(@Body() resetPasswordDTO: ResetPasswordDTO) {
    const { email } = resetPasswordDTO;

    if (email == undefined) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          error: 'data',
          message: 'missing-data',
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const UserFromDb = await this.prisma.user.findFirst({
      where: {
        email: email,
        verified: true,
      },
    });

    if (UserFromDb == null) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'user',
          message: 'email-invalid',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const token = this.defaultToken.generate();
    const digitstoken = this.generateRandomNDigits(5);
    const expiresIn = dayjs().add(15, 'minute').unix();

    const digitexist = await this.prisma.token.findFirst({
      where: {
        identifier: 'reset-password-digit-token',
        userId: UserFromDb.id,
      },
    });

    const Tokenexist = await this.prisma.token.findFirst({
      where: {
        identifier: 'reset-password-normal-token',
        userId: UserFromDb.id,
      },
    });

    if (digitexist == null) {
      await this.prisma.token.create({
        data: {
          userId: UserFromDb.id,
          expiresIn: expiresIn,
          token: String(digitstoken),
          identifier: 'reset-password-digit-token',
        },
      });
    } else {
      await this.prisma.token.update({
        where: {
          id: digitexist.id,
        },
        data: {
          userId: UserFromDb.id,
          expiresIn: expiresIn,
          token: String(digitstoken),
          identifier: 'reset-password-digit-token',
        },
      });
    }

    if (Tokenexist == null) {
      await this.prisma.token.create({
        data: {
          userId: UserFromDb.id,
          expiresIn: expiresIn,
          token: String(token),
          identifier: 'reset-password-normal-token',
        },
      });
    } else {
      await this.prisma.token.update({
        where: {
          id: Tokenexist.id,
        },
        data: {
          userId: UserFromDb.id,
          expiresIn: expiresIn,
          token: String(token),
          identifier: 'reset-password-normal-token',
        },
      });
    }

    await this.sendMailService.SendMail({
      from: '<no-reply@nestjsauth.com.br>',
      to: email,
      subject: `${UserFromDb.name}, código de confirmação.`,
      text: `${UserFromDb.email}, seu código para trocar a senha é: ${digitstoken}  Caso nao tenha solicitado, ignore este email.`,
      html: `<h1>${UserFromDb.email}</h1><br /><h3>Seu código para trocar a senha é: ${digitstoken}</h3><br/><br /> <span><i>Caso nao tenha solicitado, ignore este email.</i></span>`,
    });

    return { statusCode: 200, message: 'look-email', content: { token } };
  }
}
