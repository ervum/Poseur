import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

import {
  EmailValidationPattern,
  PhoneNumberValidationPattern
} from '@ervum/constants';
import {
  type RecoverUsernameData,
  type RecoverPhoneData,
  type RecoverEmailData,
  type RecoverPasswordData
} from '@ervum/types';



const ErrorCodePrefix: string = '01_';

const EmptyFieldError: string = `${ErrorCodePrefix}000`;
const InvalidEmailError: string = `${ErrorCodePrefix}001`;
const InvalidPhoneNumberError: string = `${ErrorCodePrefix}008`;



export class RecoverUsernameDTO implements RecoverUsernameData {
  @Matches(EmailValidationPattern, { message: InvalidEmailError })
  @IsOptional()
  Email?: string;

  @Matches(PhoneNumberValidationPattern, { message: InvalidPhoneNumberError })
  @IsString()
  @IsOptional()
  PhoneNumber?: string;
}

export class RecoverPhoneDTO implements RecoverPhoneData {
  @IsString()
  @IsOptional()
  Username?: string;

  @Matches(EmailValidationPattern, { message: InvalidEmailError })
  @IsOptional()
  Email?: string;
}

export class RecoverEmailDTO implements RecoverEmailData {
  @IsString()
  @IsOptional()
  Username?: string;

  @Matches(PhoneNumberValidationPattern, { message: InvalidPhoneNumberError })
  @IsString()
  @IsOptional()
  PhoneNumber?: string;
}

export class RecoverPasswordDTO implements RecoverPasswordData {
  @IsString()
  @IsNotEmpty({ message: EmptyFieldError })
  UserIdentifier!: string;
}
