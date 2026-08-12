import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { RecoverUsernameData, RecoverPhoneData, RecoverEmailData, RecoverPasswordData } from '@ervum/types';



const ErrorCodePrefix: string = '01_';

const EmptyFieldError: string = `${ErrorCodePrefix}000`;
const InvalidEmailError: string = `${ErrorCodePrefix}001`;



export class RecoverUsernameDTO implements RecoverUsernameData {
  @IsEmail({}, { message: InvalidEmailError })
  @IsOptional()
  Email?: string;

  @IsString()
  @IsOptional()
  PhoneNumber?: string;
}

export class RecoverPhoneDTO implements RecoverPhoneData {
  @IsString()
  @IsOptional()
  Username?: string;

  @IsEmail({}, { message: InvalidEmailError })
  @IsOptional()
  Email?: string;
}

export class RecoverEmailDTO implements RecoverEmailData {
  @IsString()
  @IsOptional()
  Username?: string;

  @IsString()
  @IsOptional()
  PhoneNumber?: string;
}

export class RecoverPasswordDTO implements RecoverPasswordData {
  @IsString()
  @IsNotEmpty({ message: EmptyFieldError })
  UserIdentifier!: string;
}
