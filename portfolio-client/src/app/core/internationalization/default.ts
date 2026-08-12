export type TranslationDictionary = {
  LanguageCode: string;

  PageName: string;

  SignIn: string;
  SignUp: string;
  RememberMe: string;

  Email: string;
  PhoneNumber: string;
  Username: string;
  UserIdentifier: string;
  Password: string;

  LanguageName_English: string;
  LanguageName_Spanish: string;

  AccountRecovery: string;
  Recover: string;
  Continue: string;
  RecoveryIntro: string;

  Home: string;
  OR: string;

  ExtensionWarningTooltip: string;

  Error_00_000: string;
  Error_01_000: string;
  Error_01_001: string;
  Error_01_002: string;
  Error_01_003: string;
  Error_01_004: string;
  Error_01_005: string;
  Error_01_006: string;
  Error_01_007: string;
};



export const DefaultDictionary: TranslationDictionary = {
  LanguageCode: 'en',
  
  PageName: 'TBD',
  
  SignIn: 'Sign In',
  SignUp: 'Sign Up',
  RememberMe: 'Remember me',

  Email: 'Email',
  PhoneNumber: 'Phone number',
  Username: 'Username',
  UserIdentifier: 'User Identifier',
  Password: 'Password',

  LanguageName_English: 'English',
  LanguageName_Spanish: 'Spanish',

  AccountRecovery: 'Account recovery',
  Recover: 'recover',
  Continue: 'Continue',
  RecoveryIntro: "I'd like to recover my",
  
  Home: 'HOME',
  OR: 'OR',

  ExtensionWarningTooltip: 'A third-party extension is modifying this page. Some parts of the interface may appear visually different from the original design.',

  Error_00_000: 'An unexpected error occurred. Please try again.',
  Error_01_000: '[1] cannot be empty.',
  Error_01_001: 'The email address introduced is invalid.',
  Error_01_002: 'Password must be longer than or equal to 6 characters.',
  Error_01_003: 'Invalid credentials. Please check your username and password.',
  Error_01_004: 'No account was found with the provided details.',
  Error_01_005: 'Username already exists.',
  Error_01_006: 'Email already exists.',
  Error_01_007: 'Phone number already exists.',
};
