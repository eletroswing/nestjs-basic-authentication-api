import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Options,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../../prisma.service';
import { SigninDTO } from './signin-dto';
import { RefreshTokenService } from '../token-generation/refresh-token/refresh-token.service';
import { JwttokenService } from '../token-generation/jwttoken/jwttoken.service';

@Controller('signin')
export class SigninController {
  constructor(
    private prisma: PrismaService,
    private refreshTokenGenerate: RefreshTokenService,
    private jwttokenService: JwttokenService,
  ) {}
  @Post()
  async handle(@Body() singinDTO: SigninDTO) {
    const { email, password } = singinDTO;
    if (email == undefined || password == undefined) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          error: 'data',
          message: 'missing-data',
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    //get user from db
    const UserFromDb = await this.prisma.user.findFirst({
      where: {
        email: email,
        verified: true,
      },
    });

    //user exists?
    if (UserFromDb == null) {
      //if no
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'login',
          message: 'email-password-invalid',
        },
        HttpStatus.FORBIDDEN,
      );
    } else {
      //if yes
      //password match?
      if (!bcrypt.compareSync(password, UserFromDb.password)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            error: 'email-password',
            message: 'email-password-invalid',
          },
          HttpStatus.FORBIDDEN,
        );
      } else {
        //generate jwt token (double?)
        const JWTtoken = await this.jwttokenService.generateJWTToken(
          UserFromDb.id,
        );
        //generate refresh token
        const refreshtoken =
          await this.refreshTokenGenerate.generateRefreshToken(UserFromDb.id);
        //return response to user
        return {
          statusCode: 200,
          refresh_token: refreshtoken,
          jwt_token: JWTtoken,
        };
      }
    }
  }
  @Options()
  async SendOptions() {
    return { statusCode: 200, fields: ['email', 'password'] };
  }
}
