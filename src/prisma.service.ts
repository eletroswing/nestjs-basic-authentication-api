import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    //make password hash when update or create user
    this.$use(async (params, next) => {
      if (
        (params.action == 'create') &&
        params.model == 'User'
      ) {
        let user = params.args.data;
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(user.password, salt);
        user.password = hash;
        params.args.data = user;
      }

      if (
        (params.action == 'update') &&
        params.model == 'User' &&
        params.args.data.password != undefined
      ) {
        let user = params.args.data;
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(user.password, salt);
        user.password = hash;
        params.args.data = user;
      }
      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
