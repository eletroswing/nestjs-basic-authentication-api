import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as dayjs from 'dayjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwttokenService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}
  async generateJWTToken(userId: string) {
    if (userId == undefined || userId.trim() == '') {
      throw new Error('userID required to generate jwt token');
    }
    const TokenInDb = await this.prisma.token.findFirst({
      where: {
        userId: userId,
        identifier: 'auth-jwt-token',
      },
    });

    const token = this.jwtService.sign({ userId: userId });
    const expirationtime = dayjs().add(60, 'second').unix();

    if (TokenInDb == null) {
      await this.prisma.token.create({
        data: {
          userId: userId,
          token: token,
          expiresIn: expirationtime,
          identifier: 'auth-jwt-token',
        },
      });
    } else {
      await this.prisma.token.update({
        where: {
          id: TokenInDb.id,
        },
        data: {
          userId: userId,
          token: token,
          expiresIn: expirationtime,
          identifier: 'auth-jwt-token',
        },
      });
    }

    return {
      token: token,
      expiresIn: expirationtime,
    };
  }
}
