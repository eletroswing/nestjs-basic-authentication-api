import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { RegenerateRefreshToken } from './regenerate-refresh-token-dto';
import { PrismaService } from 'src/prisma.service';
import * as dayjs from 'dayjs';
import { JwttokenService } from '../token-generation/jwttoken/jwttoken.service';
import { RefreshTokenService } from '../token-generation/refresh-token/refresh-token.service';

@Controller('regenerate-token')
export class RegenerateRefreshTokenController {
  constructor(
    private prisma: PrismaService,
    private refreshTokenGenerate: RefreshTokenService,
    private jwttokenService: JwttokenService,
  ) {}
  @Post()
  async handle(@Body() OldTokens: RegenerateRefreshToken) {
    const { refreshToken, jwtToken } = OldTokens;
    if (refreshToken == undefined || jwtToken == undefined) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          error: 'data',
          message: 'missing-data',
        },
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    //find refresh token on db
    const RefreshTokenOnDb = await this.prisma.token.findFirst({
      where: {
        token: refreshToken,
        identifier: 'auth-refresh-token',
      },
    });

    //find jwt on db
    const JWTTokenOnDb = await this.prisma.token.findFirst({
      where: {
        token: jwtToken,
        identifier: 'auth-jwt-token',
      },
    });
    //if both tokens are ok
    //not
    if (JWTTokenOnDb == null || RefreshTokenOnDb == null) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'tokens',
          message: 'invalid-tokens',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    //yes
    else {
      //both are from same owner
      if (JWTTokenOnDb.userId != RefreshTokenOnDb.userId) {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            error: 'tokens',
            message: 'different-token-owner',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      //is refresh token still not expirated
      if (dayjs(dayjs().unix()).isAfter(RefreshTokenOnDb.expiresIn)) {
        //no
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            error: 'tokens',
            message: 'exirated-tokens',
          },
          HttpStatus.FORBIDDEN,
        );
      } else {
        //yes
        //regenerate tokens
        const newRefreshToken =
          await this.refreshTokenGenerate.generateRefreshToken(
            RefreshTokenOnDb.userId,
          );
        const newJWTtoken = await this.jwttokenService.generateJWTToken(
          JWTTokenOnDb.userId,
        );
        //return tokens
        return {
          statusCode: 200,
          refresh_token: newRefreshToken,
          jwtToken: newJWTtoken,
        };
      }
    }
  }
}
