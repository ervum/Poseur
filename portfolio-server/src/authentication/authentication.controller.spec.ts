import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';



describe('AuthenticationController', () => {
  let Controller: AuthenticationController;

  const MockUsersService = {};

  beforeEach(async () => {
    const Module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: MockUsersService,
        },
      ],
    }).compile();

    Controller = Module.get<AuthenticationController>(AuthenticationController);
  });

  it('Should be defined', () => {
    expect(Controller).toBeDefined();
  });
});
