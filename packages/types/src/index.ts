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
  Code:      string;
  IsGeneral: boolean;
};

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
  '01_008': { Code: '01_008', IsGeneral: false },
};



///          Server Types          \\\
export type ConfigurationType = {
  URL:             string;
  Port:            number;

  ProxyURL:        string;
  SlashedProxyURL: string;
};

export type DatabaseConfigurationType = {
  Host:     string;
  Port:     number;

  User:     string;
  Password: string;

  Name:     string;
};

export type SecretsType = {
  Database: DatabaseConfigurationType;
};

export type ServerConfigurationType = (ConfigurationType & SecretsType);

export type AuthenticationFormFieldType = ('Email' | 'PhoneNumber' | 'UserIdentifier' | 'Username' | 'Password');
export type AuthenticationTabType = ('Sign In' | 'Sign Up');
export type RecoveryTargetType = ('Username' | 'PhoneNumber' | 'Email' | 'Password');



export interface LoginData {
  UserIdentifier: string;
  Password:       string;
};

export interface RegisterData {
  Email:       string;
  PhoneNumber: string;

  Username:    string;
  Password:    string;
};

export interface FieldErrorDescriptor {
  Key:         string;
  FieldKey?:   string;
  RawMessage?: string;
  IsGeneral?:  boolean;
};

export interface RecoverUsernameData {
  Email?:       string;
  PhoneNumber?: string;
};

export interface RecoverPhoneData {
  Username?: string;
  Email?:    string;
};

export interface RecoverEmailData {
  Username?:    string;
  PhoneNumber?: string;
};

export interface RecoverPasswordData {
  UserIdentifier: string;
};

export interface RecoverUsernameResultItem {
  Username:  string;
  MatchedBy: string[];
};

export interface RecoverUsernameResponse {
  Results: RecoverUsernameResultItem[];
};

export interface RecoverPhoneResultItem {
  PhoneNumber: string;
  MatchedBy:   string[];
};

export interface RecoverPhoneResponse {
  Results: RecoverPhoneResultItem[];
};

export interface RecoverEmailResultItem {
  Email:     string;
  MatchedBy: string[];
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
export type FancyUIElementStyleType = ('Standard' | 'Backgroundless' | 'Accent');

export type FancyUIElementFocusStateType = ('Focusing' | 'Focused' | 'Unfocusing' | 'Unfocused');
export type FancyUIElementLoadStatusType = ('Idle' | 'Loading' | 'Success' | 'Error');

export type SlideStateType = ('In' | 'Out');

export type IconNameType = (
  | 'arrow'
  | 'at'
  | 'checkmark'
  | 'contour'
  | 'crossmark'
  | 'envelope'
  | 'eye'
  | 'gradient'
  | 'grid'
  | 'hidden'
  | 'house'
  | 'key'
  | 'layers'
  | 'lock'
  | 'logo'
  | 'moon'
  | 'next-arrow'
  | 'orbs'
  | 'parcels'
  | 'phone'
  | 'refresh'
  | 'shaftless-arrow'
  | 'shaftless-next-arrow'
  | 'shuffle'
  | 'spotlight'
  | 'sun'
  | 'user'
  | 'waves'
);

export type FancyIconNameType = (IconNameType | string);
export type IconVariantType = ('Stroked' | 'Filled');
export type FancyIconVariantType = IconVariantType;

export interface IconVariantsDescriptor {
  Stroked: string;
  Filled:  string;
};

export type NGStylesType = { [key: string]: string; };

/////      Fancy Multibutton     \\\\\
export type FancyMultiButtonDisplayModeType = ('Text' | 'Icon');
export type FancyMultiButtonIndicatorStyleType = ('Dot' | 'Dash');

export type HorizontalPositionType = ('Left' | 'Right');
export type VerticalPositionType = ('Above' | 'Below');

export interface FancyMultibuttonItemType {
  ID?:              string;
  Label:            string;
  Action?:          AnyFunction;
  ActionArguments?: unknown[];
};

/////       Fancy Sidebar        \\\\\
export type FancySidebarSideType = ('Left' | 'Right' | 'Top' | 'Bottom');
export type FancySidebarModeType = ('Viewport' | 'Container');

/////        Fancy Button        \\\\\
export type FancyButtonIconStateType = ('AtCenter' | 'Exiting' | 'OffScreen' | 'Entering');

/////        Fancy Textbox       \\\\\
export type FancyTextboxOrderType = ('First' | 'Intermediate' | 'Last' | 'Unique');
export type FancyTextboxIconStateType = ('Idle' | 'Exiting' | 'Entering');

/////       Fancy Dropdown       \\\\\
export interface FancyDropdownItemType {
  ID?:              string;
  Label:            string;
  Action?:          AnyFunction;
  ActionArguments?: unknown[];
};

/////       Fancy Checkbox       \\\\\
export type FancyCheckboxCheckStateType = ('Checked' | 'Unchecked' | 'Mixed');



/////   Procedural Backgrounds   \\\\\
export interface BackgroundPalette {
  Name:     string;
  Colors:   string[];
  Colours?: string[];
};

export interface RGBColor {
  R: number;
  G: number;
  B: number;
};

export type RGBColour = RGBColor;

export interface AuroraSphere {
  /** Pre-computed inline styles (position, size, background, CSS custom properties). */
  Styles: NGStylesType;
};

export interface AtmospherePalettePairDescriptor {
  Dark:  BackgroundPalette;
  Light: BackgroundPalette;
};

export interface AtmosphereStateDescriptor {
  Palette: AtmospherePalettePairDescriptor;
  Spheres: AuroraSphere[];
};

export type BackgroundLayerIDType = (
  | 'Topographic'
  | 'Blueprint'
  | 'Cadastral'
  | 'Silk'
  | 'Mesh'
  | 'Spotlight'
  | 'Aurora'
);

export type BackgroundMotionModeType = ('Static' | 'Ambient' | 'Evolving');
export type BackgroundConfigurationModeType = ('Random' | 'Custom');
export type VisitorBackgroundPreferenceModeType = ('SiteDefault' | 'Random' | 'Custom');
export type BackgroundScopeType = ('Public' | 'Admin');

export interface BackgroundLayerSettings {
  Enabled:   boolean;
  Motion:    BackgroundMotionModeType;
  Intensity: number;
  Density:   number;
};

export interface BackgroundLayerParameterBoundsDescriptor {
  readonly Minimum: number;
  readonly Maximum: number;
  readonly Step:    number;
  readonly Default: number;
};

export interface BackgroundLayerRandomRangeDescriptor {
  readonly Minimum: number;
  readonly Maximum: number;
};

export interface BackgroundLayerDescriptor {
  readonly ID:                   BackgroundLayerIDType;
  readonly Name:                 string;
  readonly Description:          string;
  readonly Icon:                 IconNameType;
  readonly ZIndex:               number;
  readonly DefaultSettings:      BackgroundLayerSettings;
  readonly IntensityBounds:      BackgroundLayerParameterBoundsDescriptor;
  readonly DensityBounds:        BackgroundLayerParameterBoundsDescriptor;
  readonly RandomIntensityRange: BackgroundLayerRandomRangeDescriptor;
  readonly RandomDensityRange:   BackgroundLayerRandomRangeDescriptor;
};

export type BackgroundLayersMap = Record<BackgroundLayerIDType, BackgroundLayerSettings>;

export interface BackgroundConfiguration {
  Mode:   BackgroundConfigurationModeType;
  Layers: BackgroundLayersMap;
};

export interface VisitorBackgroundOverride {
  Mode:         VisitorBackgroundPreferenceModeType;
  CustomLayers: BackgroundLayersMap;
};

export interface BackgroundAccentPaletteStop {
  readonly Name:           string;
  readonly Hex:            string;
  readonly RGB:            RGBColor;
  readonly Hue:            number;
  readonly Saturation:     number;
  readonly LightnessDark:  number;
  readonly LightnessLight: number;
};

export type BackgroundGoldPaletteStop = BackgroundAccentPaletteStop;

export interface BackgroundTextDescriptor {
  readonly HeaderButtonTooltip:     string;
  readonly DrawerTitle:             string;
  readonly DrawerSubtitle:          string;
  readonly PublicSectionTitle:      string;
  readonly PublicSectionSubtitle:   string;
  readonly AdminSectionTitle:       string;
  readonly AdminSectionSubtitle:    string;
  readonly ModeLabel:               string;
  readonly ModeSiteDefaultLabel:    string;
  readonly ModeRandomLabel:         string;
  readonly ModeCustomLabel:         string;
  readonly RerollButtonLabel:       string;
  readonly ResetButtonLabel:        string;
  readonly MotionLabel:             string;
  readonly MotionStaticLabel:       string;
  readonly MotionAmbientLabel:      string;
  readonly MotionEvolvingLabel:     string;
  readonly IntensityLabel:          string;
  readonly DensityLabel:            string;
  readonly ActiveLayersCountSuffix: string;
  readonly ReducedEffectsNotice:    string;
};



/////       Feature Badges       \\\\\
export type FeatureBadgeColorType = ('Green' | 'Neutral' | 'Red');

export interface FeatureBadgeDescriptor {
  ID:    string;
  Label: string;
  Color: FeatureBadgeColorType;
};
