import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';

import {
  type Nullable,
  type Undefinable,
  type RecoverUsernameResultItem,
  type RecoverPhoneResultItem,
  type RecoverEmailResultItem,
  type RecoverUsernameResponse,
  type RecoverPhoneResponse,
  type RecoverEmailResponse,
  type RecoverPasswordResponse
} from '@ervum/types';

import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import {
  RecoverUsernameDTO,
  RecoverPhoneDTO,
  RecoverEmailDTO,
  RecoverPasswordDTO
} from './dto/recover.dto';



@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly UsersService: UsersService) {}

  @Post('register')
  async Register(@Body() Data: RegisterDTO): Promise<User> {
    const [
      ExistingUserByUsername,
      ExistingUserByEmail,
      ExistingUserByPhoneNumber
    ]: [Nullable<User>, Nullable<User>, Nullable<User>] = await Promise.all([
      this.UsersService.FindByUsername(Data.Username),
      this.UsersService.FindByEmail(Data.Email),
      this.UsersService.FindByPhoneNumber(Data.PhoneNumber),
    ]);

    const ErrorMessages: string[] = [];

    if (ExistingUserByUsername) {
      ErrorMessages.push('Username: 01_005');
    }

    if (ExistingUserByEmail) {
      ErrorMessages.push('Email: 01_006');
    }

    if (ExistingUserByPhoneNumber) {
      ErrorMessages.push('PhoneNumber: 01_007');
    }

    if ((ErrorMessages.length) > 0) {
      throw new BadRequestException(ErrorMessages);
    }

    return this.UsersService.Create(Data);
  }

  @Post('login')
  async Login(@Body() Data: LoginDTO): Promise<User> {
    const FoundUser: Nullable<User> = await this.UsersService.FindByUserIdentifier(Data.UserIdentifier);

    if (FoundUser && ((FoundUser.Password) === (Data.Password))) {
      return FoundUser;
    }

    throw new UnauthorizedException('01_003');
  }

  @Post('recover/username')
  async RecoverUsername(@Body() Data: RecoverUsernameDTO): Promise<RecoverUsernameResponse> {
    return this.ResolveDualFieldRecovery<RecoverUsernameResultItem>(
      (Data.PhoneNumber),
      (PhoneNumber: string): Promise<Nullable<User>> => this.UsersService.FindByPhoneNumber(PhoneNumber),
      (Data.Email),
      (Email: string): Promise<Nullable<User>> => this.UsersService.FindByEmail(Email),
      (MatchedUser: User, MatchedBy: string[]): RecoverUsernameResultItem => ({
        Username:  (MatchedUser.Username),
        MatchedBy,
      })
    );
  }

  @Post('recover/phone')
  async RecoverPhone(@Body() Data: RecoverPhoneDTO): Promise<RecoverPhoneResponse> {
    return this.ResolveDualFieldRecovery<RecoverPhoneResultItem>(
      (Data.Username),
      (Username: string): Promise<Nullable<User>> => this.UsersService.FindByUsername(Username),
      (Data.Email),
      (Email: string): Promise<Nullable<User>> => this.UsersService.FindByEmail(Email),
      (MatchedUser: User, MatchedBy: string[]): RecoverPhoneResultItem => ({
        PhoneNumber: (MatchedUser.PhoneNumber),
        MatchedBy,
      })
    );
  }

  @Post('recover/email')
  async RecoverEmail(@Body() Data: RecoverEmailDTO): Promise<RecoverEmailResponse> {
    return this.ResolveDualFieldRecovery<RecoverEmailResultItem>(
      (Data.Username),
      (Username: string): Promise<Nullable<User>> => this.UsersService.FindByUsername(Username),
      (Data.PhoneNumber),
      (PhoneNumber: string): Promise<Nullable<User>> => this.UsersService.FindByPhoneNumber(PhoneNumber),
      (MatchedUser: User, MatchedBy: string[]): RecoverEmailResultItem => ({
        Email:     (MatchedUser.Email),
        MatchedBy,
      })
    );
  }

  @Post('recover/password')
  async RecoverPassword(@Body() Data: RecoverPasswordDTO): Promise<RecoverPasswordResponse> {
    const FoundUser: Nullable<User> = await this.UsersService.FindByUserIdentifier(Data.UserIdentifier);

    if (!FoundUser) {
      throw new NotFoundException('01_004');
    }

    return { Password: (FoundUser.Password) };
  }

  private async ResolveDualFieldRecovery<TResult>(
    FirstInput: Undefinable<string>,
    FirstLookup: ((Value: string) => (Promise<Nullable<User>>)),
    SecondInput: Undefinable<string>,
    SecondLookup: ((Value: string) => (Promise<Nullable<User>>)),
    ProjectResult: ((MatchedUser: User, MatchedBy: string[]) => (TResult))
  ): Promise<{ Results: TResult[] }> {
    const [FirstUser, SecondUser]: [Nullable<User>, Nullable<User>] = await Promise.all([
      FirstInput ? FirstLookup(FirstInput) : Promise.resolve(null),
      SecondInput ? SecondLookup(SecondInput) : Promise.resolve(null),
    ]);

    const Results: TResult[] = [];

    if (FirstUser && SecondUser && FirstInput && SecondInput) {
      if ((FirstUser.ID) === (SecondUser.ID)) {
        Results.push(ProjectResult(FirstUser, [FirstInput, SecondInput]));
      } else {
        Results.push(ProjectResult(FirstUser, [FirstInput]));
        Results.push(ProjectResult(SecondUser, [SecondInput]));
      }
    } else if (FirstUser && FirstInput) {
      Results.push(ProjectResult(FirstUser, [FirstInput]));
    } else if (SecondUser && SecondInput) {
      Results.push(ProjectResult(SecondUser, [SecondInput]));
    }

    if ((Results.length) === 0) {
      throw new NotFoundException('01_004');
    }

    return { Results };
  }
}
