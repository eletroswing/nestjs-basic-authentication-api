import { Controller, Post, Body, HttpException, HttpStatus, Options } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SignupDTO } from './signup-dto';
import { v4 } from 'uuid';
import * as dayjs from 'dayjs';
import { SendMailProducerService } from '../../../jobs/sendmail/sendmail-producer-service';
import { ConfigModule } from '@nestjs/config';

import { DefaultTokenService } from '../token-generation/default-token/default-token.service';

@Controller('signup')
export class SignupController {
    constructor(private prisma: PrismaService, private sendMailService: SendMailProducerService, private defaultToken: DefaultTokenService) {}
    @Post()
    async handle(@Body() signupDTO: SignupDTO){
        const { name, username, email, password, redirecturl, redirecterrorurl} = signupDTO;

        //if missing data from request
        if(name == undefined || email == undefined || username == undefined || password == undefined || redirecturl == undefined || redirecterrorurl == undefined){
            throw new HttpException({
                statusCode: HttpStatus.NOT_ACCEPTABLE,
                error: 'data',
                message: 'missing-data',
              }, HttpStatus.NOT_ACCEPTABLE);
        }

        //verify if user exists on database
        let CurrentUserEmail = await this.prisma.user.findFirst({
            where: {
                email: email
            }
        })

        //if user already exists
        if(CurrentUserEmail != null && CurrentUserEmail.verified == true){
            throw new HttpException({
              statusCode: HttpStatus.CONFLICT,
              error: 'user',
              message: 'already-exists',
            }, HttpStatus.CONFLICT);
        }

        //dont exists, start creating the user
        //non existent user
        if(CurrentUserEmail == null){
            CurrentUserEmail = await this.prisma.user.create({
                data: {
                    email: email,
                    name: name,
                    password: password,
                    username: username
                }
            })
        }

        //updating user
        if(CurrentUserEmail != null && CurrentUserEmail.verified == false ){
            CurrentUserEmail = await this.prisma.user.update({
                where: {
                    id: CurrentUserEmail.id
                },
                data: {
                    email: email,
                    name: name,
                    password: password,
                    username: username
                }
            })
        }
        
        //token processing 
        let ExpirationTime = dayjs().add(15, 'minute').unix(); //time for expiration
        let Token = this.defaultToken.generate(); //token

        //create or update token
        //already exist token?
        let TokenOnDatabase = await this.prisma.token.findFirst({
            where: {
                userId: CurrentUserEmail.id,
                identifier: 'account-confirmation-token'
            }
        })

        if(TokenOnDatabase == null){
            await this.prisma.token.create({
                data: {
                    userId: CurrentUserEmail.id,
                    identifier: 'account-confirmation-token',
                    token: Token,
                    expiresIn: ExpirationTime
                }
            })
        }else{
            await this.prisma.token.update({
                where: {
                    id: TokenOnDatabase.id,
                },
                data: {
                    expiresIn: ExpirationTime,
                    token: Token
                }
            })
        }

        //send email to user
        let Link = process.env.URL + `/api/v1/signup-confirmation?token=${Token}&&redirecturl=${redirecturl}&&redirecterror=${redirecterrorurl}` 
        await this.sendMailService.SendMail({
            from: "<no-reply@nestjsauth.com.br>", 
            to: email, 
            subject: `${name}, confirme sua conta.`, 
            text: `${name}, por favor, confirme sua conta em: ${Link}  Caso nao tenha solicitado, ignore este email.`,
            html: `<h1>${name}</h1><br /><h3>Por favor, confirme sua conta clicando <a href="${Link}">aqui.</a></h3><br/><br /> <span><i>Caso nao tenha solicitado, ignore este email.</i></span>`
        })

        return {statusCode: 201, message: 'look-email'}
    }
    @Options()
    async SendOptions(){
        return {statusCode: 200, fields: ['name', 'username', 'email', 'password', 'redirecturl', 'redirecterrorurl']}
    }
}
