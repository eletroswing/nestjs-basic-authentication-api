import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class DefaultTokenService {
    generate() {
        let token = v4() + '-' + v4() + '-' + v4() + '-' + v4() + '-' + v4() + '-' + v4() + '-' + v4()
        return token
    }
}
