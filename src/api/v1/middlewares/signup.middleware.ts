import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  

@Injectable()
export class SignUpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { password, passwordConfirmation, email } = req.body;
    if (
      password == undefined ||
      passwordConfirmation == undefined ||
      email == undefined
    ) {
      res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .json({
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          error: 'data',
          message: 'missing-data',
        });
    }
    else if(password != passwordConfirmation){
        res
        .status(HttpStatus.PRECONDITION_FAILED)
        .json({
          statusCode: HttpStatus.PRECONDITION_FAILED,
          error: 'password',
          message: 'password-must-match',
        });
    }
    else if(!validateEmail(email)){
        res
        .status(HttpStatus.PRECONDITION_FAILED)
        .json({
          statusCode: HttpStatus.PRECONDITION_FAILED,
          error: 'email',
          message: 'enter-valid-email',
        });
    }
    else{
        next();
    }
  }
}
