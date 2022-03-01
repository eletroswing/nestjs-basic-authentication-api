import { Controller, Query, Get, Res } from '@nestjs/common';
import { SignupConfirmationDTO } from './signupConfirmation-dto';

import { PrismaService } from '../../../prisma.service';
import * as dayjs from 'dayjs';
 
@Controller('signup-confirmation')
export class SignupConfirmationController {
    constructor (private prisma: PrismaService){}
    @Get()
    async handle(@Query() signupConfirmationDTO: SignupConfirmationDTO, @Res() res: any) {
        const { redirecturl, token, redirecterror} = signupConfirmationDTO;

        //get token in database
        let TokenInDb = await this.prisma.token.findFirst({
            where: {
                identifier: 'account-confirmation-token',
                token: token
            }
        })

        //if token doest exist 
        if (TokenInDb == null){
            res.status(301).redirect(redirecterror)
        }
        //if token exists, but expired
        if(TokenInDb != null){
            if(dayjs(dayjs().unix()).isAfter(TokenInDb.expiresIn)){
                res.status(301).redirect(redirecterror)
            }
            else{
                //confirm user
                await this.prisma.user.update({
                    where: {
                        id: TokenInDb.userId
                    },
                    data: {
                        verified: true
                    }
                })

                //delete token
                await this.prisma.token.delete({
                    where: {
                        id: TokenInDb.id
                    }
                })
                res.status(200).redirect(redirecturl)
            }
        }
    }
}
