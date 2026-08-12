import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let Controller: UsersController;

  const MockUsersService = {};

  beforeEach(async () => {
    const Module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: MockUsersService,
        },
      ],
    }).compile();

    Controller = Module.get<UsersController>(UsersController);
  });

  it('Should be defined', () => {
    expect(Controller).toBeDefined();
  });
});
