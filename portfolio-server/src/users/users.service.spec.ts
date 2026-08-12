import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UsersService } from './users.service';
import { User } from './users.entity';



describe('UsersService', () => {
  let Service: UsersService;
  let UserRepository: Repository<User>;

  const MockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const Module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: MockUserRepository,
        },
      ],
    }).compile();

    Service = Module.get<UsersService>(UsersService);
    UserRepository = Module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(Service).toBeDefined();
  });

  describe('Create', () => {
    it('Should create and save a new user', async () => {
      const MockUserDTO = {
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Username: 'testuser',
        Password: 'password123',
      };
      const MockSavedUser: User = { ID: 1, ...MockUserDTO };

      MockUserRepository.create.mockReturnValue(MockSavedUser);
      MockUserRepository.save.mockResolvedValue(MockSavedUser);

      const Result: User = await Service.Create(MockUserDTO);

      expect(MockUserRepository.create).toHaveBeenCalledWith(MockUserDTO);
      expect(MockUserRepository.save).toHaveBeenCalledWith(MockSavedUser);
      expect(Result).toEqual(MockSavedUser);
    });
  });

  describe('FindByUserIdentifier', () => {
    it('Should look up user by username, email, and phone number conditions', async () => {
      const MockUser: User = {
        ID: 1,
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Username: 'testuser',
        Password: 'password123',
      };

      MockUserRepository.findOne.mockResolvedValue(MockUser);

      const Result: User | null = await Service.FindByUserIdentifier('testuser');

      expect(MockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { Username: 'testuser' },
          { Email: 'testuser' },
          { PhoneNumber: 'testuser' },
        ],
      });
      expect(Result).toEqual(MockUser);
    });

    it('Should look up user by username, email, phone number, and numeric ID', async () => {
      const MockUser: User = {
        ID: 123,
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Username: 'testuser',
        Password: 'password123',
      };

      MockUserRepository.findOne.mockResolvedValue(MockUser);

      const Result: User | null = await Service.FindByUserIdentifier(123);

      expect(MockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { Username: '123' },
          { Email: '123' },
          { PhoneNumber: '123' },
          { ID: 123 },
        ],
      });
      expect(Result).toEqual(MockUser);
    });

    it('Should not query by ID if the identifier is a phone number with plus sign or out-of-range integer', async () => {
      const MockUser: User = {
        ID: 1,
        Email: 'test@example.com',
        PhoneNumber: '5491112345678',
        Username: 'testuser',
        Password: 'password123',
      };

      MockUserRepository.findOne.mockResolvedValue(MockUser);

      const Result: User | null = await Service.FindByUserIdentifier('+5491112345678');

      expect(MockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { Username: '+5491112345678' },
          { Email: '+5491112345678' },
          { PhoneNumber: '+5491112345678' },
        ],
      });
      expect(Result).toEqual(MockUser);
    });
  });

  describe('FindByEmail', () => {
    it('Should find user by email', async () => {
      const MockUser: User = {
        ID: 1,
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Username: 'testuser',
        Password: 'password123',
      };

      MockUserRepository.findOne.mockResolvedValue(MockUser);

      const Result: User | null = await Service.FindByEmail('test@example.com');

      expect(MockUserRepository.findOne).toHaveBeenCalledWith({
        where: { Email: 'test@example.com' },
      });
      expect(Result).toEqual(MockUser);
    });
  });

  describe('FindByPhoneNumber', () => {
    it('Should find user by phone number', async () => {
      const MockUser: User = {
        ID: 1,
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Username: 'testuser',
        Password: 'password123',
      };

      MockUserRepository.findOne.mockResolvedValue(MockUser);

      const Result: User | null = await Service.FindByPhoneNumber('1234567890');

      expect(MockUserRepository.findOne).toHaveBeenCalledWith({
        where: { PhoneNumber: '1234567890' },
      });
      expect(Result).toEqual(MockUser);
    });
  });

  describe('FindByUsername', () => {
    it('Should find user by username', async () => {
      const MockUser: User = {
        ID: 1,
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Username: 'testuser',
        Password: 'password123',
      };

      MockUserRepository.findOne.mockResolvedValue(MockUser);

      const Result: User | null = await Service.FindByUsername('testuser');

      expect(MockUserRepository.findOne).toHaveBeenCalledWith({
        where: { Username: 'testuser' },
      });
      expect(Result).toEqual(MockUser);
    });
  });

  describe('FindByUsernameOrEmail', () => {
    it('Should find user by username or email', async () => {
      const MockUser: User = {
        ID: 1,
        Email: 'test@example.com',
        PhoneNumber: '1234567890',
        Username: 'testuser',
        Password: 'password123',
      };

      MockUserRepository.findOne.mockResolvedValue(MockUser);

      const Result: User | null = await Service.FindByUsernameOrEmail('testuser');

      expect(MockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { Username: 'testuser' },
          { Email: 'testuser' }
        ],
      });
      expect(Result).toEqual(MockUser);
    });
  });
});
