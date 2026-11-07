import { Component, inject, signal, WritableSignal, computed, type Signal, AfterViewInit, PLATFORM_ID, DestroyRef } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, NavigationStart } from '@angular/router';

import { CompactViewportMaximumWidth } from '@ervum/constants';
import {
  type Nullable,
  type Undefinable,
  type FancyMultibuttonItemType,
  type FancyDropdownItemType,
  type IconNameType
} from '@ervum/types';

import { filter } from 'rxjs';

import { BackgroundsComponent } from './shared/components/standalone/backgrounds/backgrounds';
import { BackgroundDesignerPanelComponent } from './shared/components/standalone/backgrounds/designer-panel/designer-panel';
import { DropdownComponent } from './shared/components/standalone/dropdown/dropdown';
import { MinibuttonComponent } from './shared/components/standalone/minibutton/minibutton';
import { MultibuttonComponent } from './shared/components/standalone/multibutton/multibutton';
import { SidebarComponent } from './shared/components/standalone/sidebar/sidebar';
import { TooltipComponent } from './shared/components/standalone/tooltip/tooltip';

import { TypewriterDirective } from './shared/directives/typewriter/typewriter.directive';

import { InterfaceService } from './core/services/interface/interface';
import { NavigationService } from './core/services/navigation/navigation';
import { AuthenticationService } from './core/services/authentication/authentication';
import { BackgroundService } from './core/services/background/background';
import { PerformanceService } from './core/services/performance/performance';
import { Translations, type TranslationDictionary } from './core/internationalization';



const RouteSelectorIndices: Record<string, number> = {
  '/':                        0,
  '/home':                    0,
  '/authentication':          1,
  '/authentication/recovery': 1,
  '/profile':                 1,
};



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    BackgroundsComponent,
    BackgroundDesignerPanelComponent,
    DropdownComponent,
    MinibuttonComponent,
    MultibuttonComponent,
    SidebarComponent,
    TooltipComponent,

    TypewriterDirective
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly DestroyReference: DestroyRef = inject(DestroyRef);

  private Router: Router = inject(Router);
  private Location: Location = inject(Location);

  private NavigationService: NavigationService = inject(NavigationService);
  public InterfaceService: InterfaceService = inject(InterfaceService);
  private AuthenticationService: AuthenticationService = inject(AuthenticationService);
  public readonly BackgroundService: BackgroundService = inject(BackgroundService);
  private readonly PerformanceService: PerformanceService = inject(PerformanceService);

  public SelectedIndex: WritableSignal<number> = signal<number>(this.GetSelectedIndex(this.Location.path()));
  public IsCompactViewport: WritableSignal<boolean> = signal<boolean>(false);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.PlatformID)) {
      setTimeout((): void => {
        document.documentElement.classList.remove('no-transitions');
      }, 100);

      const MediaQuery: MediaQueryList = window.matchMedia(`(max-width: ${CompactViewportMaximumWidth}px)`);
      this.IsCompactViewport.set(MediaQuery.matches);

      const HandleViewportChange: ((Event: MediaQueryListEvent) => (void)) = (Event: MediaQueryListEvent): void => {
        this.IsCompactViewport.set(Event.matches);
      };

      const HandleDocumentKeyDown: ((Event: KeyboardEvent) => (void)) = (Event: KeyboardEvent): void => {
        if ((Event.key) !== 'Tab') return;

        this.HandleTabLoop(Event);
      };

      MediaQuery.addEventListener('change', HandleViewportChange);
      document.addEventListener('keydown', HandleDocumentKeyDown);

      this.DestroyReference.onDestroy((): void => {
        MediaQuery.removeEventListener('change', HandleViewportChange);
        document.removeEventListener('keydown', HandleDocumentKeyDown);
      });
    }
  }

  public HandleUserButtonNavigation(): void {
    if (this.AuthenticationService.IsLoggedIn()) {
      this.NavigateWithAnimation('profile');
    } else {
      this.NavigateWithAnimation('authentication');
    }
  }

  public RouteSelectorItems: FancyMultibuttonItemType[] = [
    { Label: 'house', Action: (): void => this.NavigateWithAnimation('home') },
    { Label: 'user',  Action: (): void => this.HandleUserButtonNavigation() },
  ];

  private GetSelectedIndex(Path: string): number {
    return RouteSelectorIndices[Path.split('?')[0]] ?? 0;
  }

  public LanguageItems: Signal<FancyDropdownItemType[]> = computed((): FancyDropdownItemType[] => {
    const IsCompact: boolean = this.IsCompactViewport();
    const Dictionary: TranslationDictionary = this.InterfaceService.T();

    return Object.keys(Translations).map((Language: string): FancyDropdownItemType => ({
      ID:     Language,
      Label:  IsCompact
        ? Language.toUpperCase()
        : (Dictionary[`LanguageName_${Language}` as keyof TranslationDictionary] as string),
      Action: (): void => this.InterfaceService.SetLanguage(Language),
    }));
  });

  public CurrentLanguageItem: Signal<Undefinable<FancyDropdownItemType>> = computed((): Undefinable<FancyDropdownItemType> => {
    const CurrentLanguage: string = this.InterfaceService.Language();

    return this.LanguageItems().find((Item: FancyDropdownItemType): boolean => ((Item.ID) === CurrentLanguage));
  });

  public ThemeIcon: Signal<IconNameType> = computed((): IconNameType => {
    return ((this.InterfaceService.InterfaceType()) === 'Primary')
      ? 'sun'
      : 'moon';
  });

  public NavigateWithAnimation(Target: string): void {
    this.NavigationService.NavigateWithAnimation(Target);
  }

  public NavigateHome(Event: MouseEvent): void {
    Event.preventDefault();
    this.NavigateWithAnimation('home');
  }

  public ToggleTheme(Event: MouseEvent): void {
    if (this.InterfaceService.DarkModeExtensionActive()) return;

    let X: number = Event.clientX;
    let Y: number = Event.clientY;

    if ((X === 0) && (Y === 0) && Event.currentTarget) {
      const BoundingRectangle: DOMRect = (Event.currentTarget as HTMLElement).getBoundingClientRect();
      X = (BoundingRectangle.left + (BoundingRectangle.width / 2));
      Y = (BoundingRectangle.top + (BoundingRectangle.height / 2));
    }

    this.InterfaceService.ToggleInterfaceTypeWithTransition(X, Y);
  }

  public NavigateBack(): void {
    const URL: string = this.Router.url;
    const Segments: string[] = URL.split('/').filter((Segment: string): boolean => (Segment !== ''));

    if ((Segments.length) > 0) {
      Segments.pop();

      const Target: string = Segments.join('/') || '';
      this.NavigateWithAnimation(Target);
    }
  }

  private IsElementVisible(Element: HTMLElement): boolean {
    if (typeof (Element.checkVisibility) === 'function') {
      if (!Element.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true })) {
        return false;
      }
    } else {
      const Style: CSSStyleDeclaration = window.getComputedStyle(Element);
      if (((Style.display) === 'none') || ((Style.visibility) === 'hidden')) {
        return false;
      }
    }

    return ((Element.getClientRects().length) > 0);
  }

  private GetFocusableElements(): HTMLElement[] {
    if (!isPlatformBrowser(this.PlatformID)) {
      return [];
    }

    const Selectors: string = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
    ].join(',');

    const OpenDrawerElement: Nullable<HTMLElement> = this.BackgroundService.IsDrawerOpen()
      ? (document.querySelector('FancySidebar.FancySidebar--Open .FancySidebar-Drawer') as Nullable<HTMLElement>)
      : null;

    const ScopeRoot: ParentNode = OpenDrawerElement ?? document;
    const Elements: HTMLElement[] = Array.from(ScopeRoot.querySelectorAll(Selectors)) as HTMLElement[];

    return Elements.filter((Element: HTMLElement): boolean => this.IsElementVisible(Element));
  }

  public HandleTabLoop(Event: KeyboardEvent): void {
    if ((Event.key) !== 'Tab') return;

    const FocusableElements: HTMLElement[] = this.GetFocusableElements();
    if ((FocusableElements.length) === 0) return;

    const ActiveElement: HTMLElement = document.activeElement as HTMLElement;
    const Index: number = FocusableElements.indexOf(ActiveElement);

    if (Event.shiftKey) {
      if (Index <= 0) {
        Event.preventDefault();
        FocusableElements[(FocusableElements.length) - 1].focus();
      }
    } else {
      if ((Index === -1) || (Index === ((FocusableElements.length) - 1))) {
        Event.preventDefault();
        FocusableElements[0].focus();
      }
    }
  }

  constructor() {
    this.Router.events.pipe(
      filter((Event: unknown): Event is (NavigationEnd | NavigationStart) =>
        (Event instanceof NavigationEnd) || (Event instanceof NavigationStart)
      )
    ).subscribe((Event: NavigationEnd | NavigationStart): void => {
      this.SelectedIndex.set(this.GetSelectedIndex(Event.url));
    });
  }
}
