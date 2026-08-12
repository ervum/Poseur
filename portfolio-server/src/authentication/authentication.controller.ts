import { Controller, Post, Body, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { RecoverUsernameDTO, RecoverPhoneDTO, RecoverEmailDTO, RecoverPasswordDTO } from './dto/recover.dto';
import { User } from '../users/users.entity';

import { Nullable, Undefinable, RecoverUsernameResponse, RecoverPhoneResponse, RecoverEmailResponse, RecoverPasswordResponse } from '@ervum/types';



@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly UsersService: UsersService) {}

  @Post('register')
  async Register(@Body() Data: RegisterDTO): Promise<User> {
    const ErrorMessages: string[] = [];

    const ExistingUserByUsername: Nullable<User> = await this.UsersService.FindByUsername(Data.Username);

    if (ExistingUserByUsername) {
      ErrorMessages.push('Username: 01_005');
    }

    const ExistingUserByEmail: Nullable<User> = await this.UsersService.FindByEmail(Data.Email);

    if (ExistingUserByEmail) {
      ErrorMessages.push('Email: 01_006');
    }

    const ExistingUserByPhoneNumber: Nullable<User> = await this.UsersService.FindByPhoneNumber(Data.PhoneNumber);

    if (ExistingUserByPhoneNumber) {
      ErrorMessages.push('PhoneNumber: 01_007');
    }

    if (ErrorMessages.length > 0) {
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
    const Results: { Username: string; MatchedBy: string }[] = [];

    const Phone: Undefinable<string> = Data.PhoneNumber;
    const Email: Undefinable<string> = Data.Email;

    const UserByPhone: Nullable<User> = Phone ? await this.UsersService.FindByPhoneNumber(Phone) : null;
    const UserByEmail: Nullable<User> = Email ? await this.UsersService.FindByEmail(Email) : null;

    if (UserByPhone && UserByEmail && Phone && Email) {
      if (UserByPhone.ID === UserByEmail.ID) {
        Results.push({ Username: UserByPhone.Username, MatchedBy: `${Phone} and ${Email}` });
      } else {
        Results.push({ Username: UserByPhone.Username, MatchedBy: Phone });
        Results.push({ Username: UserByEmail.Username, MatchedBy: Email });
      }
    } else if (UserByPhone && Phone) {
      Results.push({ Username: UserByPhone.Username, MatchedBy: Phone });
    } else if (UserByEmail && Email) {
      Results.push({ Username: UserByEmail.Username, MatchedBy: Email });
    }

    if (Results.length === 0) {
      throw new NotFoundException('01_004');
    }

    return { Results };
  }

  @Post('recover/phone')
  async RecoverPhone(@Body() Data: RecoverPhoneDTO): Promise<RecoverPhoneResponse> {
    const Results: { PhoneNumber: string; MatchedBy: string }[] = [];

    const Username: Undefinable<string> = Data.Username;
    const Email: Undefinable<string> = Data.Email;

    const UserByUsername: Nullable<User> = Username ? await this.UsersService.FindByUsername(Username) : null;
    const UserByEmail: Nullable<User> = Email ? await this.UsersService.FindByEmail(Email) : null;

    if (UserByUsername && UserByEmail && Username && Email) {
      if (UserByUsername.ID === UserByEmail.ID) {
        Results.push({ PhoneNumber: UserByUsername.PhoneNumber, MatchedBy: `${Username} and ${Email}` });
      } else {
        Results.push({ PhoneNumber: UserByUsername.PhoneNumber, MatchedBy: Username });
        Results.push({ PhoneNumber: UserByEmail.PhoneNumber, MatchedBy: Email });
      }
    } else if (UserByUsername && Username) {
      Results.push({ PhoneNumber: UserByUsername.PhoneNumber, MatchedBy: Username });
    } else if (UserByEmail && Email) {
      Results.push({ PhoneNumber: UserByEmail.PhoneNumber, MatchedBy: Email });
    }

    if (Results.length === 0) {
      throw new NotFoundException('01_004');
    }

    return { Results };
  }

  @Post('recover/email')
  async RecoverEmail(@Body() Data: RecoverEmailDTO): Promise<RecoverEmailResponse> {
    const Results: { Email: string; MatchedBy: string }[] = [];

    const Username: Undefinable<string> = Data.Username;
    const Phone: Undefinable<string> = Data.PhoneNumber;

    const UserByUsername: Nullable<User> = Username ? await this.UsersService.FindByUsername(Username) : null;
    const UserByPhone: Nullable<User> = Phone ? await this.UsersService.FindByPhoneNumber(Phone) : null;

    if (UserByUsername && UserByPhone && Username && Phone) {
      if (UserByUsername.ID === UserByPhone.ID) {
        Results.push({ Email: UserByUsername.Email, MatchedBy: `${Username} and ${Phone}` });
      } else {
        Results.push({ Email: UserByUsername.Email, MatchedBy: Username });
        Results.push({ Email: UserByPhone.Email, MatchedBy: Phone });
      }
    } else if (UserByUsername && Username) {
      Results.push({ Email: UserByUsername.Email, MatchedBy: Username });
    } else if (UserByPhone && Phone) {
      Results.push({ Email: UserByPhone.Email, MatchedBy: Phone });
    }

    if (Results.length === 0) {
      throw new NotFoundException('01_004');
    }

    return { Results };
  }

  @Post('recover/password')
  async RecoverPassword(@Body() Data: RecoverPasswordDTO): Promise<RecoverPasswordResponse> {
    const FoundUser: Nullable<User> = await this.UsersService.FindByUserIdentifier(Data.UserIdentifier);

    if (!FoundUser) {
      throw new NotFoundException('01_004');
    }

    return { Password: FoundUser.Password };
  }
}

