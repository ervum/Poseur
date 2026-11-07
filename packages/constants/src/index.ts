import {
  type FeatureBadgeColorType,
  type BackgroundLayerIDType,
  type BackgroundMotionModeType,
  type BackgroundConfigurationModeType,
  type BackgroundAccentPaletteStop,
  type BackgroundLayerDescriptor,
  type BackgroundLayerSettings,
  type BackgroundLayersMap,
  type BackgroundConfiguration,
  type VisitorBackgroundOverride,
  type BackgroundTextDescriptor,
  type FancyMultibuttonItemType,
  type Nullable,
  type Undefinable
} from '@ervum/types';



///          Badge Constants          \\\
export const FeatureBadgeColorPriorityMap: Record<FeatureBadgeColorType, number> = {
  'Green':   1,
  'Neutral': 2,
  'Red':     3,
};



///          Interface Constants          \\\
export const IconsBasePath: string = '/assets/icons/';
export const IconFileExtension: string = '.svg';
export const IconFilledSuffix: string = '-filled';

export const CompactViewportMaximumWidth: number = 768;

export const RouteTransitionDurationMilliseconds: number = 800;
export const RouteTransitionEasing: string = 'cubic-bezier(0.86, 0, 0.07, 1)';

export const ReducedEffectsFrameBudgetMilliseconds: number = 28;
export const ReducedEffectsProbeFrameCount: number = 45;

export const AtmosphereIdleTimeoutMilliseconds: number = 2500;
export const AtmosphereScrollSettleMilliseconds: number = 120;

export const SoftwareRendererSignatures: string[] = [
  'swiftshader',
  'llvmpipe',
  'softpipe',
  'software',
  'basic render',
  'mesa offscreen',
];

export const HeroContactURL: string = 'mailto:contact@ervum.dev';

export const HeroTechnologyStack: string[] = [
  'TypeScript',
  'Angular',
  'NestJS',
  'PostgreSQL',
  'Node.js',
  'SCSS',
];



///          Validation & Authentication Constants          \\\
export const EmailValidationPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PhoneNumberValidationPattern: RegExp = /^(?=(?:\D*\d){6,15}\D*$)[0-9+\-() ]+$/;

export const PhoneNumberMinimumDigits: number = 6;
export const PhoneNumberMaximumLength: number = 15;
export const PhoneNumberAllowedCharacters: string = '0123456789+-() ';

export const PasswordMinimumLength: number = 6;

export const ErrorTooltipResetDelayMilliseconds: number = 5000;
export const AuthenticationRedirectDelayMilliseconds: number = 500;
export const AuthenticationTabSwitchErrorDelayMilliseconds: number = 400;

export function IsValidEmailAddress(Candidate: string): (boolean) {
  return EmailValidationPattern.test((Candidate.trim()));
}

export function IsValidPhoneNumber(Candidate: string): (boolean) {
  return PhoneNumberValidationPattern.test((Candidate.trim()));
}



///          Procedural Background Constants          \\\
export const PublicBackgroundConfigurationStorageKey: string = 'Poseur-Public-Background-Configuration';
export const AdminBackgroundConfigurationStorageKey: string = 'Poseur-Admin-Background-Configuration';
export const VisitorBackgroundOverrideStorageKey: string = 'Poseur-Visitor-Background-Override';
export const PublicRandomBackgroundSessionKey: string = 'Poseur-Public-Random-Background-Roll';
export const AdminRandomBackgroundSessionKey: string = 'Poseur-Admin-Random-Background-Roll';

export const BackgroundPointerSmoothingFactor: number = 0.12;
export const BackgroundScrollDebounceMilliseconds: number = 120;
export const BackgroundIdleTimeoutMilliseconds: number = 2500;
export const BackgroundEvolvingTargetFPS: number = 30;

export const BackgroundLayerIDOrder: readonly BackgroundLayerIDType[] = [
  'Mesh',
  'Aurora',
  'Topographic',
  'Cadastral',
  'Blueprint',
  'Silk',
  'Spotlight',
];

export const BackgroundMotionModes: readonly BackgroundMotionModeType[] = [
  'Static',
  'Ambient',
  'Evolving',
];

export const BackgroundAccentPalette: readonly BackgroundAccentPaletteStop[] = [
  {
    Name:           'Lumina Violet',
    Hex:            '#8b7cff',
    RGB:            { R: 139, G: 124, B: 255 },
    Hue:            247,
    Saturation:     100,
    LightnessDark:  74,
    LightnessLight: 58,
  },
  {
    Name:           'Obsidian Indigo',
    Hex:            '#5b47e0',
    RGB:            { R: 91, G: 71, B: 224 },
    Hue:            248,
    Saturation:     72,
    LightnessDark:  62,
    LightnessLight: 52,
  },
  {
    Name:           'Electric Periwinkle',
    Hex:            '#6e8efb',
    RGB:            { R: 110, G: 142, B: 251 },
    Hue:            226,
    Saturation:     95,
    LightnessDark:  71,
    LightnessLight: 56,
  },
  {
    Name:           'Soft Lavender',
    Hex:            '#c4b5fd',
    RGB:            { R: 196, G: 181, B: 253 },
    Hue:            252,
    Saturation:     95,
    LightnessDark:  85,
    LightnessLight: 68,
  },
  {
    Name:           'Deep Cosmic Indigo',
    Hex:            '#4338ca',
    RGB:            { R: 67, G: 56, B: 202 },
    Hue:            245,
    Saturation:     58,
    LightnessDark:  51,
    LightnessLight: 44,
  },
  {
    Name:           'Radiant Amethyst',
    Hex:            '#a855f7',
    RGB:            { R: 168, G: 85, B: 247 },
    Hue:            271,
    Saturation:     91,
    LightnessDark:  65,
    LightnessLight: 54,
  },
];

export const BackgroundGoldPalette: readonly BackgroundAccentPaletteStop[] = BackgroundAccentPalette;

export const BackgroundLayerDescriptors: Record<BackgroundLayerIDType, BackgroundLayerDescriptor> = {
  Topographic: {
    ID:          'Topographic',
    Name:        'Topographic Contours',
    Description: 'Cartographic elevation contours generated via Simplex noise and master isolines.',
    Icon:        'contour',
    ZIndex:      3,
    DefaultSettings: {
      Enabled:   true,
      Motion:    'Ambient',
      Intensity: 52,
      Density:   48,
    },
    IntensityBounds:      { Minimum: 0, Maximum: 100, Step: 1, Default: 52 },
    DensityBounds:        { Minimum: 0, Maximum: 100, Step: 1, Default: 48 },
    RandomIntensityRange: { Minimum: 32, Maximum: 68 },
    RandomDensityRange:   { Minimum: 30, Maximum: 65 },
  },
  Blueprint: {
    ID:          'Blueprint',
    Name:        'Architectural Grid',
    Description: 'Technical blueprint grid with major/minor subdivisions and radial cursor highlight.',
    Icon:        'grid',
    ZIndex:      5,
    DefaultSettings: {
      Enabled:   false,
      Motion:    'Ambient',
      Intensity: 45,
      Density:   50,
    },
    IntensityBounds:      { Minimum: 0, Maximum: 100, Step: 1, Default: 45 },
    DensityBounds:        { Minimum: 0, Maximum: 100, Step: 1, Default: 50 },
    RandomIntensityRange: { Minimum: 28, Maximum: 60 },
    RandomDensityRange:   { Minimum: 35, Maximum: 65 },
  },
  Cadastral: {
    ID:          'Cadastral',
    Name:        'Cadastral Parcels',
    Description: 'Subdivided geometric parcels and urban blocks with primary avenues and selective glow.',
    Icon:        'parcels',
    ZIndex:      4,
    DefaultSettings: {
      Enabled:   false,
      Motion:    'Ambient',
      Intensity: 48,
      Density:   45,
    },
    IntensityBounds:      { Minimum: 0, Maximum: 100, Step: 1, Default: 48 },
    DensityBounds:        { Minimum: 0, Maximum: 100, Step: 1, Default: 45 },
    RandomIntensityRange: { Minimum: 30, Maximum: 62 },
    RandomDensityRange:   { Minimum: 30, Maximum: 60 },
  },
  Silk: {
    ID:          'Silk',
    Name:        'Silk Harmonics',
    Description: 'Parallel harmonic filaments modulated by smooth vector fields in violet-indigo tones.',
    Icon:        'waves',
    ZIndex:      6,
    DefaultSettings: {
      Enabled:   false,
      Motion:    'Ambient',
      Intensity: 46,
      Density:   42,
    },
    IntensityBounds:      { Minimum: 0, Maximum: 100, Step: 1, Default: 46 },
    DensityBounds:        { Minimum: 0, Maximum: 100, Step: 1, Default: 42 },
    RandomIntensityRange: { Minimum: 28, Maximum: 62 },
    RandomDensityRange:   { Minimum: 25, Maximum: 58 },
  },
  Mesh: {
    ID:          'Mesh',
    Name:        'Atmospheric Mesh',
    Description: 'Deep radial washes in Lumina violet, periwinkle, and cosmic indigo with slow drift.',
    Icon:        'gradient',
    ZIndex:      1,
    DefaultSettings: {
      Enabled:   true,
      Motion:    'Ambient',
      Intensity: 58,
      Density:   50,
    },
    IntensityBounds:      { Minimum: 0, Maximum: 100, Step: 1, Default: 58 },
    DensityBounds:        { Minimum: 0, Maximum: 100, Step: 1, Default: 50 },
    RandomIntensityRange: { Minimum: 38, Maximum: 72 },
    RandomDensityRange:   { Minimum: 35, Maximum: 68 },
  },
  Spotlight: {
    ID:          'Spotlight',
    Name:        'Ambient Spotlight & Grain',
    Description: 'Soft halo that follows the pointer with micro-granulated editorial film texture.',
    Icon:        'spotlight',
    ZIndex:      7,
    DefaultSettings: {
      Enabled:   true,
      Motion:    'Ambient',
      Intensity: 44,
      Density:   35,
    },
    IntensityBounds:      { Minimum: 0, Maximum: 100, Step: 1, Default: 44 },
    DensityBounds:        { Minimum: 0, Maximum: 100, Step: 1, Default: 35 },
    RandomIntensityRange: { Minimum: 28, Maximum: 60 },
    RandomDensityRange:   { Minimum: 20, Maximum: 50 },
  },
  Aurora: {
    ID:          'Aurora',
    Name:        'Aurora Orbs',
    Description: 'Diffused organic spheres in violet, indigo, and lavender tones with smooth parallax.',
    Icon:        'orbs',
    ZIndex:      2,
    DefaultSettings: {
      Enabled:   true,
      Motion:    'Ambient',
      Intensity: 55,
      Density:   45,
    },
    IntensityBounds:      { Minimum: 0, Maximum: 100, Step: 1, Default: 55 },
    DensityBounds:        { Minimum: 0, Maximum: 100, Step: 1, Default: 45 },
    RandomIntensityRange: { Minimum: 35, Maximum: 70 },
    RandomDensityRange:   { Minimum: 30, Maximum: 65 },
  },
};

export const DefaultBackgroundLayersMap: BackgroundLayersMap = {
  Topographic: { ...(BackgroundLayerDescriptors.Topographic.DefaultSettings) },
  Blueprint:   { ...(BackgroundLayerDescriptors.Blueprint.DefaultSettings) },
  Cadastral:   { ...(BackgroundLayerDescriptors.Cadastral.DefaultSettings) },
  Silk:        { ...(BackgroundLayerDescriptors.Silk.DefaultSettings) },
  Mesh:        { ...(BackgroundLayerDescriptors.Mesh.DefaultSettings) },
  Spotlight:   { ...(BackgroundLayerDescriptors.Spotlight.DefaultSettings) },
  Aurora:      { ...(BackgroundLayerDescriptors.Aurora.DefaultSettings) },
};

export function CloneBackgroundLayersMap(Source?: Nullable<Partial<BackgroundLayersMap>>): (BackgroundLayersMap) {
  const Result: Partial<BackgroundLayersMap> = { };

  for (const LayerID of BackgroundLayerIDOrder) {
    const Descriptor: BackgroundLayerDescriptor = BackgroundLayerDescriptors[LayerID];
    const Candidate: Undefinable<Partial<BackgroundLayerSettings>> = Source?.[LayerID];
    const RawMotion: Undefinable<BackgroundMotionModeType> = Candidate?.Motion;
    const ValidMotion: BackgroundMotionModeType = (
      (RawMotion === 'Static') || (RawMotion === 'Ambient') || (RawMotion === 'Evolving')
    )
      ? RawMotion
      : (Descriptor.DefaultSettings.Motion);

    const RawIntensity: number = ((typeof (Candidate?.Intensity) === 'number') && !Number.isNaN(Candidate.Intensity))
      ? (Candidate.Intensity)
      : (Descriptor.DefaultSettings.Intensity);

    const RawDensity: number = ((typeof (Candidate?.Density) === 'number') && !Number.isNaN(Candidate.Density))
      ? (Candidate.Density)
      : (Descriptor.DefaultSettings.Density);

    Result[LayerID] = {
      Enabled:   (typeof (Candidate?.Enabled) === 'boolean') ? (Candidate.Enabled) : (Descriptor.DefaultSettings.Enabled),
      Motion:    ValidMotion,
      Intensity: Math.max((Descriptor.IntensityBounds.Minimum), Math.min((Descriptor.IntensityBounds.Maximum), Math.round(RawIntensity))),
      Density:   Math.max((Descriptor.DensityBounds.Minimum), Math.min((Descriptor.DensityBounds.Maximum), Math.round(RawDensity))),
    };
  }

  return Result as BackgroundLayersMap;
}

export function SanitizeBackgroundConfiguration(
  Candidate?: Nullable<Partial<BackgroundConfiguration>>,
  FallbackMode: BackgroundConfigurationModeType = 'Random'
): (BackgroundConfiguration) {
  const Mode: BackgroundConfigurationModeType = (
    ((Candidate?.Mode) === 'Random') || ((Candidate?.Mode) === 'Custom')
  )
    ? (Candidate.Mode)
    : FallbackMode;

  return {
    Mode,
    Layers: CloneBackgroundLayersMap((Candidate?.Layers) ?? null),
  };
}

export function RollRandomBackgroundLayers(
  AllowAnimatedMotion: boolean = true,
  RandomFunction: (() => (number)) = Math.random
): (BackgroundLayersMap) {
  const ShuffledIDs: BackgroundLayerIDType[] = [...BackgroundLayerIDOrder];

  for (let i: number = ((ShuffledIDs.length) - 1); i > 0; i--) {
    const SwapIndex: number = Math.floor(RandomFunction() * (i + 1));
    const Temporary: BackgroundLayerIDType = ShuffledIDs[i];
    ShuffledIDs[i] = ShuffledIDs[SwapIndex];
    ShuffledIDs[SwapIndex] = Temporary;
  }

  const Roll: number = RandomFunction();
  let EnabledCount: number;

  if (Roll < 0.15) {
    EnabledCount = 1;
  } else if (Roll < 0.45) {
    EnabledCount = 2;
  } else if (Roll < 0.72) {
    EnabledCount = 3;
  } else if (Roll < 0.88) {
    EnabledCount = 4;
  } else if (Roll < 0.94) {
    EnabledCount = 5;
  } else if (Roll < 0.98) {
    EnabledCount = 6;
  } else {
    EnabledCount = 7;
  }

  const EnabledSet: Set<BackgroundLayerIDType> = new Set<BackgroundLayerIDType>(
    ShuffledIDs.slice(0, EnabledCount)
  );

  const MultiLayerDamping: number = (EnabledCount >= 5) ? 0.72 : ((EnabledCount >= 3) ? 0.86 : 1.0);
  const Result: Partial<BackgroundLayersMap> = { };

  for (const LayerID of BackgroundLayerIDOrder) {
    const Descriptor: BackgroundLayerDescriptor = BackgroundLayerDescriptors[LayerID];
    const IntensitySpan: number = ((Descriptor.RandomIntensityRange.Maximum) - (Descriptor.RandomIntensityRange.Minimum));
    const DensitySpan: number = ((Descriptor.RandomDensityRange.Maximum) - (Descriptor.RandomDensityRange.Minimum));

    const RawIntensity: number = (
      ((Descriptor.RandomIntensityRange.Minimum) + (RandomFunction() * IntensitySpan)) * MultiLayerDamping
    );
    const RawDensity: number = ((Descriptor.RandomDensityRange.Minimum) + (RandomFunction() * DensitySpan));

    let Motion: BackgroundMotionModeType = 'Static';
    if (AllowAnimatedMotion) {
      const MotionRoll: number = RandomFunction();
      Motion = (MotionRoll < 0.2) ? 'Static' : ((MotionRoll < 0.75) ? 'Ambient' : 'Evolving');
    }

    Result[LayerID] = {
      Enabled:   EnabledSet.has(LayerID),
      Motion,
      Intensity: Math.max(10, Math.min(100, Math.round(RawIntensity))),
      Density:   Math.max(10, Math.min(100, Math.round(RawDensity))),
    };
  }

  return Result as BackgroundLayersMap;
}

export const DefaultPublicBackgroundConfiguration: BackgroundConfiguration = {
  Mode:   'Random',
  Layers: CloneBackgroundLayersMap(DefaultBackgroundLayersMap),
};

export const DefaultAdminBackgroundConfiguration: BackgroundConfiguration = {
  Mode:   'Random',
  Layers: CloneBackgroundLayersMap(DefaultBackgroundLayersMap),
};

export const DefaultVisitorBackgroundOverride: VisitorBackgroundOverride = {
  Mode:         'SiteDefault',
  CustomLayers: CloneBackgroundLayersMap(DefaultBackgroundLayersMap),
};

export const BackgroundTextDictionary: BackgroundTextDescriptor = {
  HeaderButtonTooltip:     'Customize procedural background',
  DrawerTitle:             'Background Layers',
  DrawerSubtitle:          'Combine and tune procedural background layers in real time.',
  PublicSectionTitle:      'Procedural Background for Visitors',
  PublicSectionSubtitle:   'Define the default layer combination shown to visitors.',
  AdminSectionTitle:       'Panel Procedural Background',
  AdminSectionSubtitle:    'Configure active layers for the administration panel.',
  ModeLabel:               'Selection Mode',
  ModeSiteDefaultLabel:    'Default',
  ModeRandomLabel:         'Random',
  ModeCustomLabel:         'Custom',
  RerollButtonLabel:       'Reroll',
  ResetButtonLabel:        'Reset',
  MotionLabel:             'Motion',
  MotionStaticLabel:       'Static',
  MotionAmbientLabel:      'Ambient',
  MotionEvolvingLabel:     'Evolving',
  IntensityLabel:          'Intensity',
  DensityLabel:            'Density',
  ActiveLayersCountSuffix: 'active layers',
  ReducedEffectsNotice:    'Reduced effects mode active: continuous animations are automatically simplified.',
};

export const BackgroundMotionMultibuttonItems: FancyMultibuttonItemType[] = [
  { ID: 'Static',   Label: (BackgroundTextDictionary.MotionStaticLabel) },
  { ID: 'Ambient',  Label: (BackgroundTextDictionary.MotionAmbientLabel) },
  { ID: 'Evolving', Label: (BackgroundTextDictionary.MotionEvolvingLabel) },
];

export function GetBackgroundModeMultibuttonItems(AllowSiteDefault: boolean): (FancyMultibuttonItemType[]) {
  if (AllowSiteDefault) {
    return [
      { ID: 'SiteDefault', Label: (BackgroundTextDictionary.ModeSiteDefaultLabel) },
      { ID: 'Random',      Label: (BackgroundTextDictionary.ModeRandomLabel) },
      { ID: 'Custom',      Label: (BackgroundTextDictionary.ModeCustomLabel) },
    ];
  }

  return [
    { ID: 'Random', Label: (BackgroundTextDictionary.ModeRandomLabel) },
    { ID: 'Custom', Label: (BackgroundTextDictionary.ModeCustomLabel) },
  ];
}
