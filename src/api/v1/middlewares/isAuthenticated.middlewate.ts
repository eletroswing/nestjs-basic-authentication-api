import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class IsAuthenticated implements NestMiddleware {
  constructor(private prisma: PrismaService, private jwtservice: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization == undefined || req.headers.authorization.trim().replace('Bearer', '') == '') {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({
          statusCode: HttpStatus.FORBIDDEN,
          error: 'authorization',
          message: 'undefined-bearer-token',
        });
    }
    else{
        let token = req.headers.authorization.trim().replace('Bearer ', '');
        let TokenInDb = await this.prisma.token.findFirst({
            where: {
                token: token,
                identifier: 'auth-jwt-token'
            }
        })
        if(TokenInDb == null){
            res
            .status(HttpStatus.FORBIDDEN)
            .json({
              statusCode: HttpStatus.FORBIDDEN,
              error: 'authorization',
              message: 'token-dont-exists',
            });
        }else{
            try{
                this.jwtservice.verify(token)
                next();
            }catch(error){
                res
                .status(HttpStatus.FORBIDDEN)
                .json({
                  statusCode: HttpStatus.FORBIDDEN,
                  error: 'authorization',
                  message: 'token-expirated'
                });
            }
        }
    }
  }
}
