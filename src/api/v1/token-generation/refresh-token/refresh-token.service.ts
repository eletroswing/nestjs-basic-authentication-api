import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DefaultTokenService } from '../default-token/default-token.service';
import * as dayjs from 'dayjs';

@Injectable()
export class RefreshTokenService {
    constructor(private prisma: PrismaService, private defaulToken: DefaultTokenService) {}
    async generateRefreshToken(userId: string){
        if(userId == undefined || userId.trim() == ''){
            throw new Error('userID required to generate refresh token')
        }
        let TokenInDb = await this.prisma.token.findFirst({
            where: {
                userId: userId,
                identifier: 'auth-refresh-token'                
            }
        })
        
        let token = this.defaulToken.generate();
        let expirationtime = dayjs().add(60, 'minute').unix()
        
        if(TokenInDb == null){
            await this.prisma.token.create({
                data: {
                    userId: userId,
                    token: token,
                    expiresIn: expirationtime,
                    identifier: 'auth-refresh-token'
                }
            })
        }else{
            await this.prisma.token.update({
                where: {
                    id: TokenInDb.id
                },
                data: {
                    userId: userId,
                    token: token,
                    expiresIn: expirationtime,
                    identifier: 'auth-refresh-token'
                }
            })
        }

        return {
            token: token,
            expiresIn: expirationtime
        }
    }
}
