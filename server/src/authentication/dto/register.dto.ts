import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

import {
  EmailValidationPattern,
  PasswordMinimumLength,
  PhoneNumberValidationPattern
} from '@ervum/constants';



const ErrorCodePrefix: string = '01_';

const EmptyFieldError: string = `${ErrorCodePrefix}000`;
const InvalidEmailError: string = `${ErrorCodePrefix}001`;
const InvalidPasswordError: string = `${ErrorCodePrefix}002`;
const InvalidPhoneNumberError: string = `${ErrorCodePrefix}008`;



export class RegisterDTO {
  @Matches(EmailValidationPattern, { message: InvalidEmailError })
  @IsNotEmpty({ message: EmptyFieldError })
  Email!: string;

  @Matches(PhoneNumberValidationPattern, { message: InvalidPhoneNumberError })
  @IsString()
  @IsNotEmpty({ message: EmptyFieldError })
  PhoneNumber!: string;

  @IsString()
  @IsNotEmpty({ message: EmptyFieldError })
  Username!: string;

  @IsString()
  @IsNotEmpty({ message: EmptyFieldError })
  @MinLength(PasswordMinimumLength, { message: InvalidPasswordError })
  Password!: string;
}
