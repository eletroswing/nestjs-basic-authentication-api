import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

import { faker } from '@faker-js/faker';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'online' });
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/')
      .expect(200)
      .expect({ message: 'api-online' });
  });
});

describe('SignIn User (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/signup (POST): Create User: MISSING DATA', () => {
    return request(app.getHttpServer())
      .post('/api/v1/signup')
      .send({
        redirecturl: 'www.google.com',
      })
      .expect(406)
      .expect({
        statusCode: 406,
        error: 'data',
        message: 'missing-data',
      });
  });

  it('/api/v1/signup (POST): Create User: create user: Faker', () => {
    const pass = faker.internet.password();
    return request(app.getHttpServer())
      .post('/api/v1/signup')
      .send({
        name: faker.name.findName(),
        username: faker.internet.userName(),
        redirecturl: 'www.google.com',
        password: pass,
        passwordConfirmation: pass,
        email: faker.internet.email(),
      })
      .expect(201)
      .expect({
        statusCode: 201,
        message: 'look-email',
      });
  });

  it('/api/v1/signup (POST): Create User: NO CREATE', () => {
    const pass = faker.internet.password();
    return request(app.getHttpServer())
      .post('/api/v1/signup')
      .send({
        name: 'test',
        username: 'username',
        redirecturl: 'www.google.com',
        password: pass,
        passwordConfirmation: pass,
        email: 'testmail@mail.com',
      })
      .expect(409)
      .expect({
        statusCode: 409,
        error: 'user',
        message: 'already-exists',
      });
  });
});
