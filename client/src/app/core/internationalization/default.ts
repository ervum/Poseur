export type TranslationDictionary = {
  LanguageCode: string;

  PageName: string;

  HeroEyebrow: string;
  HeroHeadline: string;
  HeroHeadlineAccent: string;
  HeroTagline: string;
  HeroPrimaryAction: string;
  HeroSecondaryAction: string;
  HeroStackLabel: string;

  AuthenticationTitleSignIn: string;
  AuthenticationTitleSignUp: string;

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
  RecoveredUsername: string;
  RecoveredPhoneNumber: string;
  RecoveredEmail: string;
  RecoveredPassword: string;
  RecoveryMatchedFor: string;
  RecoveryMatchedJoiner: string;

  ProfileTitle: string;
  ProfileStatus: string;
  SignOut: string;
  GoToAuthentication: string;

  Home: string;
  OR: string;

  ExtensionWarningTooltip: string;

  BackgroundHeaderButtonTooltip: string;
  BackgroundDrawerTitle: string;
  BackgroundDrawerSubtitle: string;
  BackgroundModeLabel: string;
  BackgroundModeSiteDefaultLabel: string;
  BackgroundModeRandomLabel: string;
  BackgroundModeCustomLabel: string;
  BackgroundRerollButtonLabel: string;
  BackgroundResetButtonLabel: string;
  BackgroundMotionLabel: string;
  BackgroundMotionStaticLabel: string;
  BackgroundMotionAmbientLabel: string;
  BackgroundMotionEvolvingLabel: string;
  BackgroundIntensityLabel: string;
  BackgroundDensityLabel: string;
  BackgroundActiveLayersCountSuffix: string;
  BackgroundReducedEffectsNotice: string;

  BackgroundLayer_Mesh_Name: string;
  BackgroundLayer_Mesh_Description: string;
  BackgroundLayer_Aurora_Name: string;
  BackgroundLayer_Aurora_Description: string;
  BackgroundLayer_Topographic_Name: string;
  BackgroundLayer_Topographic_Description: string;
  BackgroundLayer_Cadastral_Name: string;
  BackgroundLayer_Cadastral_Description: string;
  BackgroundLayer_Blueprint_Name: string;
  BackgroundLayer_Blueprint_Description: string;
  BackgroundLayer_Silk_Name: string;
  BackgroundLayer_Silk_Description: string;
  BackgroundLayer_Spotlight_Name: string;
  BackgroundLayer_Spotlight_Description: string;

  Error_00_000: string;
  Error_01_000: string;
  Error_01_001: string;
  Error_01_002: string;
  Error_01_003: string;
  Error_01_004: string;
  Error_01_005: string;
  Error_01_006: string;
  Error_01_007: string;
  Error_01_008: string;
};



export const DefaultDictionary: TranslationDictionary = {
  LanguageCode:              'en',

  PageName:                  'Poseur',

  HeroEyebrow:               'Full-Stack Architecture & Interactive Systems',
  HeroHeadline:              'Hi, I\'m ',
  HeroHeadlineAccent:        'Ervum.',
  HeroTagline:               'Full-stack software engineer crafting high-performance, glassmorphic web applications and resilient backend architectures.',
  HeroPrimaryAction:         'Enter Platform',
  HeroSecondaryAction:       'Get in Touch',
  HeroStackLabel:            'Core technology stack',

  AuthenticationTitleSignIn: 'Welcome Back',
  AuthenticationTitleSignUp: 'Create Account',

  SignIn:                    'Sign In',
  SignUp:                    'Sign Up',
  RememberMe:                'Remember me',

  Email:                     'Email',
  PhoneNumber:               'Phone number',
  Username:                  'Username',
  UserIdentifier:            'User Identifier',
  Password:                  'Password',

  LanguageName_English:      'English',
  LanguageName_Spanish:      'Spanish',

  AccountRecovery:           'Account recovery',
  Recover:                   'recover',
  Continue:                  'Continue',
  RecoveryIntro:             'I\'d like to recover my',
  RecoveredUsername:         'Recovered Username',
  RecoveredPhoneNumber:      'Recovered Phone Number',
  RecoveredEmail:            'Recovered Email',
  RecoveredPassword:         'Recovered Password',
  RecoveryMatchedFor:        'for',
  RecoveryMatchedJoiner:     'and',

  ProfileTitle:              'User Profile',
  ProfileStatus:             'Your session is active and authenticated.',
  SignOut:                   'Sign Out',
  GoToAuthentication:        'Go to authentication',

  Home:                      'HOME',
  OR:                        'OR',

  ExtensionWarningTooltip:   'A third-party extension is modifying this page. Some parts of the interface may appear visually different from the original design.',

  BackgroundHeaderButtonTooltip:          'Customize procedural background',
  BackgroundDrawerTitle:                  'Background Layers',
  BackgroundDrawerSubtitle:               'Combine and tune procedural background layers in real time.',
  BackgroundModeLabel:                    'Selection Mode',
  BackgroundModeSiteDefaultLabel:         'Default',
  BackgroundModeRandomLabel:              'Random',
  BackgroundModeCustomLabel:              'Custom',
  BackgroundRerollButtonLabel:            'Reroll',
  BackgroundResetButtonLabel:             'Reset',
  BackgroundMotionLabel:                  'Motion',
  BackgroundMotionStaticLabel:            'Static',
  BackgroundMotionAmbientLabel:           'Ambient',
  BackgroundMotionEvolvingLabel:          'Evolving',
  BackgroundIntensityLabel:               'Intensity',
  BackgroundDensityLabel:                 'Density',
  BackgroundActiveLayersCountSuffix:      'active layers',
  BackgroundReducedEffectsNotice:         'Reduced effects mode active: continuous animations are automatically simplified.',

  BackgroundLayer_Mesh_Name:              'Atmospheric Mesh',
  BackgroundLayer_Mesh_Description:       'Deep radial washes in Lumina violet, periwinkle, and cosmic indigo with slow drift.',
  BackgroundLayer_Aurora_Name:            'Aurora Orbs',
  BackgroundLayer_Aurora_Description:     'Diffused organic spheres in violet, indigo, and lavender tones with smooth parallax.',
  BackgroundLayer_Topographic_Name:       'Topographic Contours',
  BackgroundLayer_Topographic_Description:'Cartographic elevation contours generated via Simplex noise and master isolines.',
  BackgroundLayer_Cadastral_Name:         'Cadastral Parcels',
  BackgroundLayer_Cadastral_Description:  'Subdivided geometric parcels and urban blocks with primary avenues and selective glow.',
  BackgroundLayer_Blueprint_Name:         'Architectural Grid',
  BackgroundLayer_Blueprint_Description:  'Technical blueprint grid with major/minor subdivisions and radial cursor highlight.',
  BackgroundLayer_Silk_Name:              'Silk Harmonics',
  BackgroundLayer_Silk_Description:       'Parallel harmonic filaments modulated by smooth vector fields in violet-indigo tones.',
  BackgroundLayer_Spotlight_Name:         'Ambient Spotlight & Grain',
  BackgroundLayer_Spotlight_Description:  'Soft halo that follows the pointer with micro-granulated editorial film texture.',

  Error_00_000:              'An unexpected error occurred. Please try again.',
  Error_01_000:              '[1] cannot be empty.',
  Error_01_001:              'The email address introduced is invalid.',
  Error_01_002:              'Password must be longer than or equal to 6 characters.',
  Error_01_003:              'Invalid credentials. Please check your username and password.',
  Error_01_004:              'No account was found with the provided details.',
  Error_01_005:              'Username already exists.',
  Error_01_006:              'Email already exists.',
  Error_01_007:              'Phone number already exists.',
  Error_01_008:              'The phone number introduced is invalid.',
};
