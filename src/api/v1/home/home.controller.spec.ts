import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';

describe('HomeController', () => {
  let controller: HomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
    }).compile();

    controller = module.get<HomeController>(HomeController);
  });

  it('should return api online', () => {
    expect(controller.handle()).toStrictEqual({ message: 'api-online' });
  });
});
