import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Nullable } from '@ervum/types';

import { Repository, FindOptionsWhere } from 'typeorm';

import { User } from './users.entity';
import { RegisterDTO } from '../authentication/dto/register.dto';



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)

    private readonly UsersRepository: Repository<User>
  ) {}

  async Create(RegisterDTO: RegisterDTO): Promise<User> {
    const NewUser: User = this.UsersRepository.create(RegisterDTO); 

    return this.UsersRepository.save(NewUser);
  }

  /**
   * Finds a user by their identifier (Username, Email, PhoneNumber, or numeric ID).
   */
  async FindByUserIdentifier(Identifier: (string | number)): Promise<Nullable<User>> {
    const StringIdentifier: string = String(Identifier);
    const Conditions: FindOptionsWhere<User>[] = [
      { Username: StringIdentifier },

      { Email: StringIdentifier },
      { PhoneNumber: StringIdentifier }
    ];
    
    // Only attempt to query by numeric ID if the string contains only digits and is a safe 32-bit signed integer.
    if (/^\d+$/.test(StringIdentifier)) {
      const NumericIdentifier: number = parseInt(StringIdentifier, 10);

      if (!isNaN(NumericIdentifier) && NumericIdentifier > 0 && NumericIdentifier <= 2147483647) {
        Conditions.push({ ID: NumericIdentifier });
      }
    }

    return this.UsersRepository.findOne({
      where: Conditions
    });
  }

  async FindByEmail(Email: string): Promise<Nullable<User>> {
    return this.UsersRepository.findOne({
      where: { Email: Email }
    });
  }

  async FindByPhoneNumber(PhoneNumber: string): Promise<Nullable<User>> {
    return this.UsersRepository.findOne({
      where: { PhoneNumber: PhoneNumber }
    });
  }

  async FindByUsername(Username: string): Promise<Nullable<User>> {
    return this.UsersRepository.findOne({
      where: { Username: Username }
    });
  }

  async FindByUsernameOrEmail(Identifier: string): Promise<Nullable<User>> {
    return this.UsersRepository.findOne({
      where: [
        { Username: Identifier },
        { Email: Identifier }
      ]
    });
  }
}