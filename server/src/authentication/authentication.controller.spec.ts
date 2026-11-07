import { Test, type TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

import {
  type RecoverUsernameResponse,
  type RecoverPhoneResponse,
  type RecoverEmailResponse,
  type RecoverPasswordResponse
} from '@ervum/types';

import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';
import { type User } from '../users/users.entity';



describe('AuthenticationController', () => {
  let Controller: AuthenticationController;

  const SampleUserA: User = {
    ID:          1,
    Username:    'ervum',
    Email:       'ervum@example.com',
    PhoneNumber: '+1 555 010 1234',
    Password:    'Secret123',
  };

  const SampleUserB: User = {
    ID:          2,
    Username:    'poseur',
    Email:       'poseur@example.com',
    PhoneNumber: '+1 555 010 9999',
    Password:    'Secret456',
  };

  const MockUsersService = {
    FindByUsername:       jest.fn(),
    FindByEmail:          jest.fn(),
    FindByPhoneNumber:    jest.fn(),
    FindByUserIdentifier: jest.fn(),
    Create:               jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const Module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        AuthenticationService,
        {
          provide:  UsersService,
          useValue: MockUsersService,
        },
      ],
    }).compile();

    Controller = Module.get<AuthenticationController>(AuthenticationController);
  });

  it('Should be defined', () => {
    expect(Controller).toBeDefined();
  });

  describe('Register', () => {
    it('Should run uniqueness checks concurrently and create user when unique', async () => {
      MockUsersService.FindByUsername.mockResolvedValue(null);
      MockUsersService.FindByEmail.mockResolvedValue(null);
      MockUsersService.FindByPhoneNumber.mockResolvedValue(null);
      MockUsersService.Create.mockResolvedValue(SampleUserA);

      const Created: User = await Controller.Register({
        Username:    SampleUserA.Username,
        Email:       SampleUserA.Email,
        PhoneNumber: SampleUserA.PhoneNumber,
        Password:    SampleUserA.Password,
      });

      expect(Created).toEqual(SampleUserA);
      expect(MockUsersService.FindByUsername).toHaveBeenCalledWith(SampleUserA.Username);
      expect(MockUsersService.FindByEmail).toHaveBeenCalledWith(SampleUserA.Email);
      expect(MockUsersService.FindByPhoneNumber).toHaveBeenCalledWith(SampleUserA.PhoneNumber);
    });

    it('Should batch all duplicate constraint error codes in BadRequestException', async () => {
      MockUsersService.FindByUsername.mockResolvedValue(SampleUserA);
      MockUsersService.FindByEmail.mockResolvedValue(SampleUserA);
      MockUsersService.FindByPhoneNumber.mockResolvedValue(SampleUserA);

      await expect(
        Controller.Register({
          Username:    SampleUserA.Username,
          Email:       SampleUserA.Email,
          PhoneNumber: SampleUserA.PhoneNumber,
          Password:    SampleUserA.Password,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Login', () => {
    it('Should return user when credentials match', async () => {
      MockUsersService.FindByUserIdentifier.mockResolvedValue(SampleUserA);

      const LoggedIn: User = await Controller.Login({
        UserIdentifier: SampleUserA.Username,
        Password:       SampleUserA.Password,
      });

      expect(LoggedIn).toEqual(SampleUserA);
    });

    it('Should throw UnauthorizedException (01_003) on invalid password', async () => {
      MockUsersService.FindByUserIdentifier.mockResolvedValue(SampleUserA);

      await expect(
        Controller.Login({
          UserIdentifier: SampleUserA.Username,
          Password:       'WrongPassword',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Recovery', () => {
    it('Should return structured MatchedBy array when both fields match the same user', async () => {
      MockUsersService.FindByPhoneNumber.mockResolvedValue(SampleUserA);
      MockUsersService.FindByEmail.mockResolvedValue(SampleUserA);

      const Response: RecoverUsernameResponse = await Controller.RecoverUsername({
        PhoneNumber: SampleUserA.PhoneNumber,
        Email:       SampleUserA.Email,
      });

      expect(Response.Results).toEqual([
        {
          Username:  SampleUserA.Username,
          MatchedBy: [SampleUserA.PhoneNumber, SampleUserA.Email],
        },
      ]);
    });

    it('Should return two separate items when phone and email match different users', async () => {
      MockUsersService.FindByUsername.mockResolvedValue(SampleUserA);
      MockUsersService.FindByEmail.mockResolvedValue(SampleUserB);

      const Response: RecoverPhoneResponse = await Controller.RecoverPhone({
        Username: SampleUserA.Username,
        Email:    SampleUserB.Email,
      });

      expect(Response.Results).toEqual([
        {
          PhoneNumber: SampleUserA.PhoneNumber,
          MatchedBy:   [SampleUserA.Username],
        },
        {
          PhoneNumber: SampleUserB.PhoneNumber,
          MatchedBy:   [SampleUserB.Email],
        },
      ]);
    });

    it('Should recover email for single field match', async () => {
      MockUsersService.FindByUsername.mockResolvedValue(SampleUserA);

      const Response: RecoverEmailResponse = await Controller.RecoverEmail({
        Username: SampleUserA.Username,
      });

      expect(Response.Results).toEqual([
        {
          Email:     SampleUserA.Email,
          MatchedBy: [SampleUserA.Username],
        },
      ]);
    });

    it('Should throw NotFoundException (01_004) when no recovery match is found', async () => {
      MockUsersService.FindByUsername.mockResolvedValue(null);
      MockUsersService.FindByPhoneNumber.mockResolvedValue(null);

      await expect(
        Controller.RecoverEmail({
          Username: 'unknown',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('Should recover password when user identifier exists', async () => {
      MockUsersService.FindByUserIdentifier.mockResolvedValue(SampleUserA);

      const Response: RecoverPasswordResponse = await Controller.RecoverPassword({
        UserIdentifier: SampleUserA.Username,
      });

      expect(Response).toEqual({ Password: SampleUserA.Password });
    });
  });
});
