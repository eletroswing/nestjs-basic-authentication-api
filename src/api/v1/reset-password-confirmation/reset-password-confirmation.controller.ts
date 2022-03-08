import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ResetPasswordConfirmationDTO } from './reset-password-confirmation-dto';
import * as dayjs from 'dayjs';

@Controller('callback/reset-password')
export class ResetPasswordConfirmationController {
  constructor(private prisma: PrismaService) {}
  @Post()
  async handle(@Body() resetpassword: ResetPasswordConfirmationDTO) {
    const { token, code, password } = resetpassword;

    if (token == undefined || code == undefined || password == undefined) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          error: 'data',
          message: 'missing-data',
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    //existing tokens?
    const TokenInDb = await this.prisma.token.findFirst({
      where: {
        token: token,
        identifier: 'reset-password-normal-token',
      },
    });

    if (TokenInDb == null) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'tokens',
          message: 'token-dont-exists',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const CodeInDb = await this.prisma.token.findFirst({
      where: {
        token: code,
        identifier: 'reset-password-digit-token',
        userId: TokenInDb.userId,
      },
    });

    if (CodeInDb == null) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'tokens',
          message: 'token-dont-exists',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (dayjs(dayjs().unix()).isAfter(CodeInDb.expiresIn)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'tokens',
          message: 'expired-token',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (dayjs(dayjs().unix()).isAfter(TokenInDb.expiresIn)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'tokens',
          message: 'expired-token',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.user.update({
      where: {
        id: TokenInDb.userId,
      },
      data: {
        password: password,
      },
    });

    await this.prisma.token.delete({
      where: {
        id: CodeInDb.id,
      },
    });

    await this.prisma.token.delete({
      where: {
        id: TokenInDb.id,
      },
    });

    return {
      statusCode: 200,
      message: 'password-changed',
    };
  }
}
