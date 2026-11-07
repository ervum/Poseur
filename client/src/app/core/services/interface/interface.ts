import { REQUEST, Injectable, signal, WritableSignal, computed, PLATFORM_ID, effect, inject, TransferState, makeStateKey, type Signal, StateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { Nullable, FancyUIElementTypeType, FancyUIElementLoadStatusType } from '@ervum/types';

import { Translations, type TranslationDictionary } from '../../internationalization';
import { PerformanceService } from '../performance/performance';



@Injectable({
  providedIn: 'root'
})
export class InterfaceService {
  private readonly TransferState: TransferState = inject(TransferState);
  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly Request: any = inject(REQUEST, { optional: true });
  private readonly IsBrowser: boolean = isPlatformBrowser(this.PlatformID);
  private readonly TitleService: Title = inject(Title);
  private readonly PerformanceService: PerformanceService = inject(PerformanceService);

  private readonly LanguageKey: StateKey<string> = makeStateKey<string>('Interface-Language');
  private readonly ThemeKey: StateKey<string> = makeStateKey<string>('Interface-Theme');

  public readonly BlockDarkModeExtensions: boolean = true;

  /** Active translation dictionary */
  public readonly T: Signal<TranslationDictionary> = computed((): TranslationDictionary => (Translations[this.Language()] || Translations['English']));

  /** Whether the typewriter animation is enabled */
  public Typewriter: WritableSignal<boolean> = signal<boolean>(true);

  /** Effective typewriter state honoring Reduced-Effects mode. */
  public readonly EffectiveTypewriter: Signal<boolean> = computed((): boolean => (this.Typewriter() && !(this.PerformanceService.IsReducedEffects())));

  /** The duration (in ms) for the global interface theme transition */
  public ThemeTransitionDuration: WritableSignal<number> = signal<number>(3000);

  /** Signal used to trigger exit animations in the active component before route changes */
  public RouteTransitionRequest: WritableSignal<Nullable<string>> = signal<Nullable<string>>(null);

  /** Whether a circular View Transition theme ripple is currently in flight. */
  public readonly IsThemeTransitioning: WritableSignal<boolean> = signal<boolean>(false);

  /** The global interface load status (Idle / Loading / Success / Error) */
  public Status: WritableSignal<FancyUIElementLoadStatusType> = signal<FancyUIElementLoadStatusType>('Idle');

  /** Signal tracking whether an active third-party dark mode extension or shader is modifying the page. */
  public DarkModeExtensionActive: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the app has completed its initial page load (used to skip animation on first render / refresh) */
  public IsAppInitialized: boolean = false;

  /** Whether a manual navigation (NavigateWithAnimation) is in progress (exit animation already handled) */
  public IsManualNavigation: boolean = false;

  /** Shared data passed between routes during navigation */
  private NavigationData: WritableSignal<any> = signal<any>(null);



  /** Helper to get initial value from Cookie/localStorage safely */
  private GetInitialValue(Key: string, DefaultValue: string): string {
    const StateKey: StateKey<string> = (Key === 'Interface-Language') ? this.LanguageKey : this.ThemeKey;
    const TransferredValue: Nullable<string> = this.TransferState.get(StateKey, null);

    const CookieValue: Nullable<string> = this.GetCookie(Key);

    if (TransferredValue) {
      return TransferredValue;
    }

    if (CookieValue) {
      if (!this.IsBrowser) {
        this.TransferState.set(StateKey, CookieValue);
      }

      return CookieValue;
    }

    if (this.IsBrowser) {
      const LocalValue: Nullable<string> = localStorage.getItem(Key);

      if (LocalValue) { return LocalValue; }
    }

    return DefaultValue;
  }

  /** Helper to read a cookie (browser or server) */
  public GetCookie(Name: string): Nullable<string> {
    let CookieString: string = '';

    if (this.IsBrowser) {
      CookieString = document.cookie;

      if (!CookieString) {
        CookieString = localStorage.getItem(Name) || '';
      }
    } else if (this.Request) {
      try {
        if (this.Request.headers && (typeof this.Request.headers.get === 'function')) {
          CookieString = this.Request.headers.get('cookie') || '';
        } else if (this.Request.headers && this.Request.headers['cookie']) {
          CookieString = this.Request.headers['cookie'];
        } else if (typeof this.Request.get === 'function') {
          CookieString = this.Request.get('cookie') || '';
        }
      } catch (Error: any) {
        console.error('Error reading cookie header on server:', Error);
      }
    }

    if (!CookieString) return null;

    const NameLengthPlus: number = (Name.length + 1);
    const Parts: string[] = CookieString.split(';');

    for (let Part of Parts) {
      Part = Part.trim();

      if (Part.substring(0, NameLengthPlus) === `${Name}=`) {
        return decodeURIComponent(Part.substring(NameLengthPlus));
      }
    }

    return null;
  }

  /** Helper to set a cookie (browser only) */
  public SetCookie(Name: string, Value: string, UpdateLocalStorage: boolean = true): void {
    if (this.IsBrowser) {
      document.cookie = `${Name}=${Value}; path=/; max-age=31536000; SameSite=Lax`;

      if (UpdateLocalStorage) {
        localStorage.setItem(Name, Value);
      }
    }
  }

  /** Helper to delete a cookie (browser only) */
  public DeleteCookie(Name: string, UpdateLocalStorage: boolean = true): void {
    if (this.IsBrowser) {
      document.cookie = `${Name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=-1; SameSite=Lax`;

      if (UpdateLocalStorage) {
        localStorage.removeItem(Name);
      }
    }
  }

  /**
   * Smart check for third-party dark mode extensions (or browser style overrides) without brute-forcing UI elements.
   */
  public CheckForDarkModeExtension(): void {
    if (!this.IsBrowser || this.BlockDarkModeExtensions) {
      if (this.DarkModeExtensionActive()) {
        this.DarkModeExtensionActive.set(false);
      }

      return;
    }

    const HasInjectedTags: boolean = document.querySelector(
      'style[class*="darkreader"], style[id*="dark-mode"], style[id*="night-eye"], style[id*="super-dark"], link[id*="dark-mode"]'
    ) !== null;

    const RootStyle: CSSStyleDeclaration = window.getComputedStyle(document.documentElement);
    const HasFilterOverride: boolean = (RootStyle.filter !== 'none') && (RootStyle.filter !== '');

    let HasColorDrift: boolean = false;

    if (this.InterfaceType() === 'Secondary') {
      const BackgroundColour: string = RootStyle.backgroundColor || '';
      const Match: Nullable<RegExpMatchArray> = BackgroundColour.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

      if (Match) {
        const R: number = parseInt(Match[1], 10);
        const G: number = parseInt(Match[2], 10);
        const B: number = parseInt(Match[3], 10);

        if (((R + G + B) / 3) < 128) {
          HasColorDrift = true;
        }
      }
    }

    this.DarkModeExtensionActive.set(HasInjectedTags || HasFilterOverride || HasColorDrift);
  }

  /**
   * Toggles the theme with a circular View Transition ripple expanding from the given coordinates.
   * Falls back to an instant toggle if the View Transitions API is unavailable or Reduced-Effects is active.
   */
  public ToggleInterfaceTypeWithTransition(X: number, Y: number): void {
    if (this.DarkModeExtensionActive()) {
      return;
    }

    if (!(this.IsBrowser) || !(document.startViewTransition) || (this.PerformanceService.IsReducedEffects())) {
      this.ToggleInterfaceType();

      return;
    }

    const EndRadius: number = Math.hypot(
      Math.max(X, ((window.innerWidth) - X)),
      Math.max(Y, ((window.innerHeight) - Y))
    );

    this.IsThemeTransitioning.set(true);

    const Transition: any = document.startViewTransition((): void => {
      this.ToggleInterfaceType();
    });

    Transition.ready.then((): void => {
      const RippleAnimation: Animation = document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${X}px ${Y}px)`,
            `circle(${EndRadius}px at ${X}px ${Y}px)`
          ]
        },

        {
          duration: this.ThemeTransitionDuration(),
          easing: 'cubic-bezier(0.86, 0, 0.07, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );

      RippleAnimation.finished.finally((): void => {
        this.IsThemeTransitioning.set(false);
      });
    }).catch((): void => {
      this.IsThemeTransitioning.set(false);
    });
  }

  /**
   * Toggles the global interface type between Primary and Secondary.
   */
  public ToggleInterfaceType(): void {
    if (this.DarkModeExtensionActive()) {
      return;
    }

    this.InterfaceType.update((CurrentType: FancyUIElementTypeType): FancyUIElementTypeType => (CurrentType === 'Primary') ? 'Secondary' : 'Primary');
  }

  /**
   * Sets the global interface type.
   */
  public SetInterfaceType(Type: FancyUIElementTypeType): void {
    this.InterfaceType.set(Type);
  }

  /**
   * Sets the global interface language.
   */
  public SetLanguage(Language: string): void {
    this.Language.set(Language);
  }

  /**
   * Sets the global interface load status with an optional timeout to reset to Idle.
   */
  public SetStatus(Status: FancyUIElementLoadStatusType, Timeout: number = 3000): void {
    this.Status.set(Status);

    if ((Status !== 'Idle') && (Status !== 'Loading')) {
      setTimeout((): void => this.Status.set('Idle'), Timeout);
    }
  }

  /**
   * Helper to get status-based classes for the main containers.
   */
  public GetStatusClasses(): Record<string, boolean> {
    return {
      [`Section--${this.Status()}`]: true
    };
  }

  /**
   * Sets the theme transition duration.
   */
  public SetThemeTransitionDuration(Duration: number): void {
    this.ThemeTransitionDuration.set(Duration);
  }

  /**
   * Sets the shared data for the next navigation.
   */
  public SetNavigationData(Data: any): void {
    this.NavigationData.set(Data);
  }

  /**
   * Retrieves and clears the shared navigation data.
   */
  public GetAndClearNavigationData(): any {
    const Data: any = this.NavigationData();
    this.NavigationData.set(null);

    return Data;
  }



  /** The global interface type (Primary / Secondary) */
  public InterfaceType: WritableSignal<FancyUIElementTypeType> = signal<FancyUIElementTypeType>(
    this.GetInitialValue('Interface-Theme', 'Primary') as FancyUIElementTypeType
  );

  /** The global interface language */
  public Language: WritableSignal<string> = signal<string>(
    this.GetInitialValue('Interface-Language', 'English')
  );



  constructor() {
    if (this.IsBrowser) {
      if (this.BlockDarkModeExtensions) {
        document.documentElement.classList.add('Block-DarkMode-Extensions');

        let MetaLock: Nullable<HTMLMetaElement> = document.querySelector('meta[name="darkreader-lock"]');

        if (!MetaLock) {
          MetaLock = document.createElement('meta');
          MetaLock.name = 'darkreader-lock';

          document.head.appendChild(MetaLock);
        }
      } else {
        document.documentElement.classList.remove('Block-DarkMode-Extensions');

        const MetaLock: Nullable<HTMLMetaElement> = document.querySelector('meta[name="darkreader-lock"]');

        if (MetaLock && MetaLock.parentNode) {
          MetaLock.parentNode.removeChild(MetaLock);
        }
      }

      if (!this.BlockDarkModeExtensions) {
        setTimeout((): void => this.CheckForDarkModeExtension(), 300);
        setInterval((): void => this.CheckForDarkModeExtension(), 2000);
      }

      effect((): void => {
        const Theme: FancyUIElementTypeType = this.InterfaceType();

        this.SetCookie('Interface-Theme', Theme);
      });

      effect((): void => {
        const Language: string = this.Language();

        this.SetCookie('Interface-Language', Language);

        document.documentElement.lang = this.T().LanguageCode;
      });

      effect((): void => {
        const Type: FancyUIElementTypeType = this.InterfaceType();

        document.documentElement.classList.remove('Theme--Primary', 'Theme--Secondary');
        document.documentElement.classList.add(`Theme--${Type}`);

        this.CheckForDarkModeExtension();
      });

      effect((): void => {
        const PageTitle: string = this.T().PageName;

        this.TitleService.setTitle(PageTitle);
      });

      effect((): void => {
        const IsTransitioning: boolean = ((this.RouteTransitionRequest() !== null) || (this.IsThemeTransitioning()));

        document.documentElement.classList.toggle('Is-Transitioning', IsTransitioning);
      });
    }
  }
}
