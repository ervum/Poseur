import { Component, inject, signal, WritableSignal, computed, type Signal, AfterViewInit, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, NavigationStart } from '@angular/router';


import { Undefinable, FancyMultibuttonItemType, FancyDropdownItemType } from '@ervum/types';

import { filter } from 'rxjs';

import { AuroraComponent } from './shared/components/standalone/aurora/aurora';
import { DeepBackgroundComponent } from './shared/components/standalone/deep-background/deep-background';

import { DropdownComponent } from './shared/components/standalone/dropdown/dropdown';
import { MinibuttonComponent } from './shared/components/standalone/minibutton/minibutton';
import { MultibuttonComponent } from './shared/components/standalone/multibutton/multibutton';
import { ContainerComponent } from './shared/components/standalone/container/container';
import { TooltipComponent } from './shared/components/standalone/tooltip/tooltip';
import { TypewriterDirective } from './shared/directives/typewriter/typewriter.directive';

import { InterfaceService } from './core/services/interface/interface';
import { NavigationService } from './core/services/navigation/navigation';
import { AuthenticationService } from './core/services/authentication/authentication';

import { Translations, type TranslationDictionary } from './core/internationalization';



const RouteSelectorIndices: Record<string, number> = {
  '/': 0,
  '/home': 0,
  '/authentication': 1,
  '/authentication/recovery': 1,
  '/profile': 1
};




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,

    AuroraComponent,
    DeepBackgroundComponent,

    DropdownComponent,
    MinibuttonComponent,
    MultibuttonComponent,
    TooltipComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  private readonly PlatformID: object = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.PlatformID)) {
      setTimeout(() => {
        document.documentElement.classList.remove('no-transitions');
      }, 100);
    }
  }

  private Router: Router = inject(Router);
  private Location: Location = inject(Location);

  private NavigationService: NavigationService = inject(NavigationService);
  public InterfaceService: InterfaceService = inject(InterfaceService);
  private AuthenticationService: AuthenticationService = inject(AuthenticationService);

  public SelectedIndex: WritableSignal<number> = signal(this.GetSelectedIndex(this.Location.path()));

  public HandleUserButtonNavigation(): void {
    if (this.AuthenticationService.IsLoggedIn()) {
      this.NavigateWithAnimation('profile');
    } else {
      this.NavigateWithAnimation('authentication');
    }
  }

  public RouteSelectorItems: FancyMultibuttonItemType[] = [
    { Label: 'house', Action: () => this.NavigateWithAnimation('home') },
    { Label: 'user', Action: () => this.HandleUserButtonNavigation() },
  ];

  private SyncSelectedIndexWithRoute(): void {
    this.SelectedIndex.set(this.GetSelectedIndex(this.Router.url));
  }

  private GetSelectedIndex(path: string): number {
    return RouteSelectorIndices[path.split('?')[0]] ?? 0;
  }

  public LanguageItems: Signal<FancyDropdownItemType[]> = computed(() => {
    return Object.keys(Translations).map((Language: string) => ({
      ID: Language,
      Label: this.InterfaceService.T()[`LanguageName_${Language}` as keyof TranslationDictionary] as string,

      Action: () => this.InterfaceService.SetLanguage(Language)
    }));
  });

  public CurrentLanguageItem: Signal<Undefinable<FancyDropdownItemType>> = computed(() => {
    const CurrentLanguage: string = this.InterfaceService.Language();

    return this.LanguageItems().find((Item: FancyDropdownItemType) => Item.ID === CurrentLanguage);
  });

  public ThemeIcon: Signal<string> = computed(() => {
    return this.InterfaceService.InterfaceType() === 'Primary' 
      ? 'assets/icons/sun.png' 
      : 'assets/icons/moon.png';
  });

  public NavigateWithAnimation(Target: string): void {
    this.NavigationService.NavigateWithAnimation(Target);
  }

  public ToggleTheme(Event: MouseEvent): void {
    if (this.InterfaceService.DarkModeExtensionActive()) return;

    let X: number = Event.clientX;
    let Y: number = Event.clientY;

    if (X === 0 && Y === 0 && Event.currentTarget) {
      const BoundingRectangle: DOMRect = (Event.currentTarget as HTMLElement).getBoundingClientRect();
      X = BoundingRectangle.left + (BoundingRectangle.width / 2);
      Y = BoundingRectangle.top + (BoundingRectangle.height / 2);
    }

    this.InterfaceService.ToggleInterfaceTypeWithTransition(X, Y);
  }

  public NavigateBack(): void {
    const URL: string = this.Router.url;
    const Segments: string[] = URL.split('/').filter((s: string) => s !== '');
    
    if ((Segments.length) > 0) {
      Segments.pop();

      const Target: string = Segments.join('/') || '';
      this.NavigateWithAnimation(Target);
    }
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
      '[contenteditable]'
    ].join(',');

    const Elements: HTMLElement[] = Array.from(document.querySelectorAll(Selectors)) as HTMLElement[];

    return Elements.filter((Element: HTMLElement) => {
      const Style: CSSStyleDeclaration = window.getComputedStyle(Element);
      if (Style.display === 'none' || Style.visibility === 'hidden') {
        return false;
      }
      
      const BoundingRectangle: DOMRect = Element.getBoundingClientRect();
      if (BoundingRectangle.width === 0 && BoundingRectangle.height === 0) {
        return false;
      }

      let Parent: HTMLElement | null = Element.parentElement;
      while (Parent) {
        const ParentStyle: CSSStyleDeclaration = window.getComputedStyle(Parent);
        if (ParentStyle.display === 'none' || ParentStyle.visibility === 'hidden') {
          return false;
        }
        Parent = Parent.parentElement;
      }

      return true;
    });
  }

  @HostListener('document:keydown', ['$event'])
  public HandleTabLoop(Event: KeyboardEvent): void {
    if (Event.key !== 'Tab') return;

    const FocusableElements: HTMLElement[] = this.GetFocusableElements();
    if (FocusableElements.length === 0) return;

    const ActiveElement: HTMLElement = document.activeElement as HTMLElement;
    const Index: number = FocusableElements.indexOf(ActiveElement);

    if (Event.shiftKey) {
      if (Index <= 0) {
        Event.preventDefault();
        FocusableElements[FocusableElements.length - 1].focus();
      }
    } else {
      if (Index === -1 || Index === FocusableElements.length - 1) {
        Event.preventDefault();
        FocusableElements[0].focus();
      }
    }
  }

  constructor() {
    this.Router.events.pipe(
      filter((Event: any): Event is NavigationEnd | NavigationStart => 
        Event instanceof NavigationEnd || Event instanceof NavigationStart
      )
    ).subscribe((Event: NavigationEnd | NavigationStart) => {
      this.SelectedIndex.set(this.GetSelectedIndex(Event.url));
    });
  }
}
