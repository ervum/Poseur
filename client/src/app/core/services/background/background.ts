import {
  Injectable,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  TransferState,
  makeStateKey,
  type WritableSignal,
  type Signal,
  type StateKey
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, type Event as RouterEvent } from '@angular/router';

import {
  type BackgroundLayerIDType,
  type BackgroundLayerSettings,
  type BackgroundLayersMap,
  type BackgroundConfiguration,
  type BackgroundConfigurationModeType,
  type VisitorBackgroundOverride,
  type VisitorBackgroundPreferenceModeType,
  type BackgroundScopeType,
  type Nullable
} from '@ervum/types';
import {
  BackgroundLayerIDOrder,
  DefaultBackgroundLayersMap,
  DefaultPublicBackgroundConfiguration,
  DefaultAdminBackgroundConfiguration,
  DefaultVisitorBackgroundOverride,
  PublicBackgroundConfigurationStorageKey,
  AdminBackgroundConfigurationStorageKey,
  VisitorBackgroundOverrideStorageKey,
  PublicRandomBackgroundSessionKey,
  AdminRandomBackgroundSessionKey,
  CloneBackgroundLayersMap,
  SanitizeBackgroundConfiguration,
  RollRandomBackgroundLayers
} from '@ervum/constants';

import { filter } from 'rxjs';

import { PerformanceService } from '../performance/performance';



@Injectable({
  providedIn: 'root'
})
export class BackgroundService {
  private static readonly PublicRollStateKey: StateKey<BackgroundLayersMap> =
    makeStateKey<BackgroundLayersMap>('Background-Public-Random-Roll');

  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly IsBrowser: boolean = isPlatformBrowser(this.PlatformID);
  private readonly TransferState: TransferState = inject(TransferState);
  private readonly RouterInstance: Router = inject(Router);
  private readonly PerformanceService: PerformanceService = inject(PerformanceService);

  public readonly ActiveScope: WritableSignal<BackgroundScopeType> = signal<BackgroundScopeType>('Public');
  public readonly IsDrawerOpen: WritableSignal<boolean> = signal<boolean>(false);

  private readonly PublicConfigurationState: WritableSignal<BackgroundConfiguration> =
    signal<BackgroundConfiguration>(this.LoadScopeConfiguration('Public'));

  private readonly AdminConfigurationState: WritableSignal<BackgroundConfiguration> =
    signal<BackgroundConfiguration>(this.LoadScopeConfiguration('Admin'));

  public readonly VisitorOverride: WritableSignal<VisitorBackgroundOverride> =
    signal<VisitorBackgroundOverride>(this.LoadVisitorOverride());

  public readonly PublicRandomRoll: WritableSignal<BackgroundLayersMap> =
    signal<BackgroundLayersMap>(this.InitializeRandomRoll('Public'));

  public readonly AdminRandomRoll: WritableSignal<BackgroundLayersMap> =
    signal<BackgroundLayersMap>(this.InitializeRandomRoll('Admin'));

  constructor() {
    this.UpdateScopeFromURL((this.RouterInstance.url) || '/');

    this.RouterInstance.events.pipe(
      filter((RouterEventInstance: RouterEvent): RouterEventInstance is NavigationEnd => (RouterEventInstance instanceof NavigationEnd))
    ).subscribe((NavigationEvent: NavigationEnd): void => {
      this.UpdateScopeFromURL((NavigationEvent.urlAfterRedirects) || (NavigationEvent.url));
    });
  }

  public readonly PublicDefaultConfiguration: Signal<BackgroundConfiguration> = computed<BackgroundConfiguration>((): BackgroundConfiguration => {
    return SanitizeBackgroundConfiguration(
      this.PublicConfigurationState(),
      'Random'
    );
  });

  public readonly AdminConfiguration: Signal<BackgroundConfiguration> = computed<BackgroundConfiguration>((): BackgroundConfiguration => {
    return SanitizeBackgroundConfiguration(
      this.AdminConfigurationState(),
      'Random'
    );
  });

  public readonly EffectivePublicLayers: Signal<BackgroundLayersMap> = computed<BackgroundLayersMap>((): BackgroundLayersMap => {
    const Override: VisitorBackgroundOverride = this.VisitorOverride();
    const SiteDefault: BackgroundConfiguration = this.PublicDefaultConfiguration();

    if ((Override.Mode) === 'Custom') {
      return (Override.CustomLayers);
    }

    if ((Override.Mode) === 'Random') {
      return this.PublicRandomRoll();
    }

    if ((SiteDefault.Mode) === 'Custom') {
      return (SiteDefault.Layers);
    }

    return this.PublicRandomRoll();
  });

  public readonly EffectiveAdminLayers: Signal<BackgroundLayersMap> = computed<BackgroundLayersMap>((): BackgroundLayersMap => {
    const AdminConfig: BackgroundConfiguration = this.AdminConfiguration();

    if ((AdminConfig.Mode) === 'Custom') {
      return (AdminConfig.Layers);
    }

    return this.AdminRandomRoll();
  });

  public readonly ActiveLayers: Signal<BackgroundLayersMap> = computed<BackgroundLayersMap>((): BackgroundLayersMap => {
    const RawLayers: BackgroundLayersMap = ((this.ActiveScope()) === 'Admin')
      ? this.EffectiveAdminLayers()
      : this.EffectivePublicLayers();

    if (!this.PerformanceService.IsReducedEffects()) {
      return RawLayers;
    }

    const Downgraded: Partial<BackgroundLayersMap> = { };
    for (const LayerID of BackgroundLayerIDOrder) {
      const CurrentLayer: BackgroundLayerSettings = RawLayers[LayerID];
      Downgraded[LayerID] = {
        ...(CurrentLayer),
        Motion: 'Static',
      };
    }

    return Downgraded as BackgroundLayersMap;
  });

  public readonly EnabledLayerIDs: Signal<BackgroundLayerIDType[]> = computed<BackgroundLayerIDType[]>((): BackgroundLayerIDType[] => {
    const Current: BackgroundLayersMap = this.ActiveLayers();

    return BackgroundLayerIDOrder.filter((LayerID: BackgroundLayerIDType): boolean => Boolean(Current[LayerID]?.Enabled));
  });

  public readonly EnabledLayerCount: Signal<number> = computed<number>((): number => {
    return (this.EnabledLayerIDs().length);
  });

  public readonly HasInteractivePointerLayer: Signal<boolean> = computed<boolean>((): boolean => {
    if (this.PerformanceService.IsReducedEffects()) {
      return false;
    }

    const Current: BackgroundLayersMap = this.ActiveLayers();

    return BackgroundLayerIDOrder.some((LayerID: BackgroundLayerIDType): boolean => {
      const Layer: BackgroundLayerSettings = Current[LayerID];

      return Boolean((Layer?.Enabled) && ((Layer.Motion) !== 'Static'));
    });
  });

  private UpdateScopeFromURL(RawURL: string): void {
    const CleanPath: string = RawURL.split('?')[0].split('#')[0].toLowerCase();
    const IsAdminRoute: boolean = CleanPath.startsWith('/admin') || CleanPath.startsWith('/media');
    this.ActiveScope.set(IsAdminRoute ? 'Admin' : 'Public');
  }

  private InitializeRandomRoll(Scope: BackgroundScopeType): BackgroundLayersMap {
    const AllowAnimated: boolean = !this.PerformanceService.IsReducedEffects();
    const SessionKey: string = (Scope === 'Admin')
      ? AdminRandomBackgroundSessionKey
      : PublicRandomBackgroundSessionKey;

    if (Scope === 'Public') {
      const TransferredRoll: Nullable<BackgroundLayersMap> = this.TransferState.get(
        BackgroundService.PublicRollStateKey,
        null
      );

      if (TransferredRoll) {
        const Sanitized: BackgroundLayersMap = CloneBackgroundLayersMap(TransferredRoll);
        this.PersistRandomRollToSession(SessionKey, Sanitized);

        return Sanitized;
      }
    }

    if (this.IsBrowser) {
      try {
        const StoredRoll: Nullable<string> = sessionStorage.getItem(SessionKey);
        if (StoredRoll) {
          const Parsed: Partial<BackgroundLayersMap> = JSON.parse(StoredRoll) as Partial<BackgroundLayersMap>;

          return CloneBackgroundLayersMap(Parsed);
        }
      } catch {
        // Ignore sessionStorage errors
      }
    }

    const FreshRoll: BackgroundLayersMap = RollRandomBackgroundLayers(AllowAnimated);

    if (!this.IsBrowser && (Scope === 'Public')) {
      this.TransferState.set(BackgroundService.PublicRollStateKey, FreshRoll);
    } else {
      this.PersistRandomRollToSession(SessionKey, FreshRoll);
    }

    return FreshRoll;
  }

  private PersistRandomRollToSession(SessionKey: string, Roll: BackgroundLayersMap): void {
    if (!this.IsBrowser) return;

    try {
      sessionStorage.setItem(SessionKey, JSON.stringify(Roll));
    } catch {
      // Ignore sessionStorage errors
    }
  }

  private LoadScopeConfiguration(Scope: BackgroundScopeType): BackgroundConfiguration {
    const StorageKey: string = (Scope === 'Admin')
      ? AdminBackgroundConfigurationStorageKey
      : PublicBackgroundConfigurationStorageKey;

    const DefaultConfig: BackgroundConfiguration = (Scope === 'Admin')
      ? DefaultAdminBackgroundConfiguration
      : DefaultPublicBackgroundConfiguration;

    if (this.IsBrowser) {
      try {
        const Raw: Nullable<string> = localStorage.getItem(StorageKey);
        if (Raw) {
          const Parsed: Partial<BackgroundConfiguration> = JSON.parse(Raw) as Partial<BackgroundConfiguration>;

          return SanitizeBackgroundConfiguration(Parsed, (DefaultConfig.Mode));
        }
      } catch {
        // Ignore storage errors
      }
    }

    return SanitizeBackgroundConfiguration(DefaultConfig, (DefaultConfig.Mode));
  }

  private SaveScopeConfiguration(Scope: BackgroundScopeType, Configuration: BackgroundConfiguration): void {
    const Sanitized: BackgroundConfiguration = SanitizeBackgroundConfiguration(Configuration, 'Random');
    const StorageKey: string = (Scope === 'Admin')
      ? AdminBackgroundConfigurationStorageKey
      : PublicBackgroundConfigurationStorageKey;

    if (Scope === 'Admin') {
      this.AdminConfigurationState.set(Sanitized);
    } else {
      this.PublicConfigurationState.set(Sanitized);
    }

    if (!this.IsBrowser) return;

    try {
      localStorage.setItem(StorageKey, JSON.stringify(Sanitized));
    } catch {
      // Ignore storage errors
    }
  }

  private LoadVisitorOverride(): VisitorBackgroundOverride {
    if (this.IsBrowser) {
      try {
        const Raw: Nullable<string> = localStorage.getItem(VisitorBackgroundOverrideStorageKey);
        if (Raw) {
          const Parsed: Partial<VisitorBackgroundOverride> = JSON.parse(Raw) as Partial<VisitorBackgroundOverride>;
          const ValidMode: VisitorBackgroundPreferenceModeType = (
            ((Parsed.Mode) === 'SiteDefault') || ((Parsed.Mode) === 'Random') || ((Parsed.Mode) === 'Custom')
          )
            ? (Parsed.Mode)
            : 'SiteDefault';

          return {
            Mode:         ValidMode,
            CustomLayers: CloneBackgroundLayersMap((Parsed.CustomLayers) ?? DefaultBackgroundLayersMap),
          };
        }
      } catch {
        // Ignore storage errors
      }
    }

    return {
      Mode:         (DefaultVisitorBackgroundOverride.Mode),
      CustomLayers: CloneBackgroundLayersMap(DefaultVisitorBackgroundOverride.CustomLayers),
    };
  }

  private SaveVisitorOverride(NextOverride: VisitorBackgroundOverride): void {
    this.VisitorOverride.set(NextOverride);

    if (!this.IsBrowser) return;

    try {
      localStorage.setItem(VisitorBackgroundOverrideStorageKey, JSON.stringify(NextOverride));
    } catch {
      // Ignore storage errors
    }
  }

  public ToggleDrawer(): void {
    this.IsDrawerOpen.update((Open: boolean): boolean => !Open);
  }

  public OpenDrawer(): void {
    this.IsDrawerOpen.set(true);
  }

  public CloseDrawer(): void {
    this.IsDrawerOpen.set(false);
  }

  public RerollRandom(Scope: BackgroundScopeType = this.ActiveScope()): BackgroundLayersMap {
    const AllowAnimated: boolean = !this.PerformanceService.IsReducedEffects();
    const FreshRoll: BackgroundLayersMap = RollRandomBackgroundLayers(AllowAnimated);

    if (Scope === 'Admin') {
      this.AdminRandomRoll.set(FreshRoll);
      this.PersistRandomRollToSession(AdminRandomBackgroundSessionKey, FreshRoll);
    } else {
      this.PublicRandomRoll.set(FreshRoll);
      this.PersistRandomRollToSession(PublicRandomBackgroundSessionKey, FreshRoll);
    }

    return FreshRoll;
  }

  public SetVisitorMode(Mode: VisitorBackgroundPreferenceModeType): void {
    const Current: VisitorBackgroundOverride = this.VisitorOverride();
    const BaseCustomLayers: BackgroundLayersMap = ((Mode === 'Custom') && ((Current.Mode) !== 'Custom'))
      ? CloneBackgroundLayersMap(this.EffectivePublicLayers())
      : (Current.CustomLayers);

    if (Mode === 'Random') {
      this.RerollRandom('Public');
    }

    this.SaveVisitorOverride({
      Mode,
      CustomLayers: BaseCustomLayers,
    });
  }

  public UpdateVisitorLayer(
    LayerID: BackgroundLayerIDType,
    PartialSettings: Partial<BackgroundLayerSettings>
  ): void {
    const SourceLayers: BackgroundLayersMap = ((this.VisitorOverride().Mode) === 'Custom')
      ? (this.VisitorOverride().CustomLayers)
      : this.EffectivePublicLayers();

    const NextLayers: BackgroundLayersMap = CloneBackgroundLayersMap({
      ...(SourceLayers),
      [LayerID]: {
        ...(SourceLayers[LayerID]),
        ...(PartialSettings),
      },
    });

    this.SaveVisitorOverride({
      Mode:         'Custom',
      CustomLayers: NextLayers,
    });
  }

  public ResetVisitorOverride(): void {
    this.RerollRandom('Public');

    this.SaveVisitorOverride({
      Mode:         'SiteDefault',
      CustomLayers: CloneBackgroundLayersMap(DefaultBackgroundLayersMap),
    });
  }

  public SetScopeConfigurationMode(
    Scope: BackgroundScopeType,
    Mode: BackgroundConfigurationModeType,
    _PersistToServer: boolean = false
  ): void {
    if (Scope === 'Admin') {
      const CurrentConfig: BackgroundConfiguration = this.AdminConfiguration();
      const BaseLayers: BackgroundLayersMap = ((Mode === 'Custom') && ((CurrentConfig.Mode) !== 'Custom'))
        ? CloneBackgroundLayersMap(this.EffectiveAdminLayers())
        : (CurrentConfig.Layers);

      if (Mode === 'Random') {
        this.RerollRandom('Admin');
      }

      this.SaveScopeConfiguration('Admin', {
        Mode,
        Layers: BaseLayers,
      });

      return;
    }

    const CurrentPublicConfig: BackgroundConfiguration = this.PublicDefaultConfiguration();
    const BasePublicLayers: BackgroundLayersMap = ((Mode === 'Custom') && ((CurrentPublicConfig.Mode) !== 'Custom'))
      ? CloneBackgroundLayersMap(this.EffectivePublicLayers())
      : (CurrentPublicConfig.Layers);

    if (Mode === 'Random') {
      this.RerollRandom('Public');
    }

    this.SaveScopeConfiguration('Public', {
      Mode,
      Layers: BasePublicLayers,
    });
  }

  public UpdateScopeLayer(
    Scope: BackgroundScopeType,
    LayerID: BackgroundLayerIDType,
    PartialSettings: Partial<BackgroundLayerSettings>,
    _PersistToServer: boolean = false
  ): void {
    if (Scope === 'Admin') {
      const SourceLayers: BackgroundLayersMap = ((this.AdminConfiguration().Mode) === 'Custom')
        ? (this.AdminConfiguration().Layers)
        : this.EffectiveAdminLayers();

      const NextAdminLayers: BackgroundLayersMap = CloneBackgroundLayersMap({
        ...(SourceLayers),
        [LayerID]: {
          ...(SourceLayers[LayerID]),
          ...(PartialSettings),
        },
      });

      this.SaveScopeConfiguration('Admin', {
        Mode:   'Custom',
        Layers: NextAdminLayers,
      });

      return;
    }

    const SourcePublicLayers: BackgroundLayersMap = ((this.PublicDefaultConfiguration().Mode) === 'Custom')
      ? (this.PublicDefaultConfiguration().Layers)
      : this.EffectivePublicLayers();

    const NextPublicLayers: BackgroundLayersMap = CloneBackgroundLayersMap({
      ...(SourcePublicLayers),
      [LayerID]: {
        ...(SourcePublicLayers[LayerID]),
        ...(PartialSettings),
      },
    });

    this.SaveScopeConfiguration('Public', {
      Mode:   'Custom',
      Layers: NextPublicLayers,
    });
  }

  public ResetScopeConfiguration(
    Scope: BackgroundScopeType,
    _PersistToServer: boolean = false
  ): void {
    if (Scope === 'Admin') {
      this.RerollRandom('Admin');
      this.SaveScopeConfiguration('Admin', SanitizeBackgroundConfiguration(DefaultAdminBackgroundConfiguration, 'Random'));

      return;
    }

    this.RerollRandom('Public');
    this.SaveScopeConfiguration('Public', SanitizeBackgroundConfiguration(DefaultPublicBackgroundConfiguration, 'Random'));
  }
}
