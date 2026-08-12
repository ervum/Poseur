///          Shared Types          \\\
/////          General           \\\\\
export type AnyFunction = ((...Arguments: any[]) => (any));
export type Void = (null | undefined);

export type Nullable<T> = (T | null);
export type Undefinable<T> = (T | undefined);
export type Voidable<T> = (T | Void);

export type StringBooleanType = ('True' | 'False');

/////         Error Codes        \\\\\
export interface ErrorInformationDescriptor {
  Code: string;
  IsGeneral: boolean;
}

export const ErrorRegistry: Record<string, ErrorInformationDescriptor> = {
  '00_000': { Code: '00_000', IsGeneral: true },
  '01_000': { Code: '01_000', IsGeneral: true },

  '01_001': { Code: '01_001', IsGeneral: false },
  '01_002': { Code: '01_002', IsGeneral: false },
  '01_003': { Code: '01_003', IsGeneral: false },
  '01_004': { Code: '01_004', IsGeneral: false },
  '01_005': { Code: '01_005', IsGeneral: false },
  '01_006': { Code: '01_006', IsGeneral: false },
  '01_007': { Code: '01_007', IsGeneral: false },
};



///          Server Types          \\\
export type ConfigurationType = {
  URL: string;
  Port: number;

  ProxyURL: string;
  SlashedProxyURL: string;
};

export type DatabaseConfigurationType = {
  Host: string;
  Port: number;

  User: string;
  Password: string;
  
  Name: string;
};

export type SecretsType = {
  Database: DatabaseConfigurationType;
};

export type ServerConfigurationType = (ConfigurationType & SecretsType);

export type AuthenticationFormFieldType = ('Email' | 'PhoneNumber' | 'UserIdentifier' | 'Username' | 'Password');
export type AuthenticationTabType = ('Sign In' | 'Sign Up');



export interface LoginData {
  UserIdentifier: string;
  Password: string;
};

export interface RegisterData {
  Email: string;
  PhoneNumber: string;

  Username: string;
  Password: string;
};

export interface FieldErrorDescriptor {
  Key: string;
  FieldKey?: string;
  RawMessage?: string;
  IsGeneral?: boolean;
};

export interface RecoverUsernameData {
  Email?: string;
  PhoneNumber?: string;
};

export interface RecoverPhoneData {
  Username?: string;
  Email?: string;
};

export interface RecoverEmailData {
  Username?: string;
  PhoneNumber?: string;
};

export interface RecoverPasswordData {
  UserIdentifier: string;
};

export interface RecoverUsernameResultItem {
  Username: string;
  MatchedBy: string;
};

export interface RecoverUsernameResponse {
  Results: RecoverUsernameResultItem[];
};

export interface RecoverPhoneResultItem {
  PhoneNumber: string;
  MatchedBy: string;
};

export interface RecoverPhoneResponse {
  Results: RecoverPhoneResultItem[];
};

export interface RecoverEmailResultItem {
  Email: string;
  MatchedBy: string;
};

export interface RecoverEmailResponse {
  Results: RecoverEmailResultItem[];
};

export interface RecoverPasswordResponse {
  Password: string;
};



///          Client Types          \\\
/////       User Interfaces      \\\\\
export type FancyUIElementTypeType = ('Primary' | 'Secondary');
export type FancyUIElementStyleType = ('Standard' | 'Backgroundless');

export type FancyUIElementFocusStateType = ('Focusing' | 'Focused' | 'Unfocusing' | 'Unfocused');
export type FancyUIElementLoadStatusType = ('Idle' | 'Loading' | 'Success' | 'Error');

export type NGStylesType = { [key: string]: string; };

/////      Fancy Multibutton     \\\\\
export type FancyMultiButtonDisplayModeType = ('Text' | 'Icon');
export type FancyMultiButtonIndicatorStyleType = ('Dot' | 'Dash');

export type HorizontalPositionType = ('Left' | 'Right');
export type VerticalPositionType = ('Above' | 'Below');

export interface FancyMultibuttonItemType {
  Label: string;
  Action?: AnyFunction;
  ActionArguments?: unknown[];
};

/////        Fancy Button        \\\\\
export type FancyButtonIconStateType = ('AtCenter' | 'Exiting' | 'OffScreen' | 'Entering');

/////        Fancy Textbox       \\\\\
export type FancyTextboxOrderType = ('First' | 'Intermediate' | 'Last' | 'Unique');
export type FancyTextboxIconStateType = ('Idle' | 'Exiting' | 'Entering');

/////       Fancy Dropdown       \\\\\
export interface FancyDropdownItemType {
  ID?: string;
  Label: string;
  Action?: AnyFunction;
  ActionArguments?: unknown[];
};

/////       Fancy Checkbox       \\\\\
export type FancyCheckboxCheckStateType = ('Checked' | 'Unchecked' | 'Mixed');



/////      Deep Background       \\\\\
export interface BackgroundPalette {
  Name: string;
  Colors: string[];
};



/////           Aurora           \\\\\
export interface RGBColor {
  R: number;
  G: number;
  B: number;
};

export interface AuroraSphere {
  /** Pre-computed inline styles (position, size, background, CSS custom properties). */
  Styles: NGStylesType;
};
