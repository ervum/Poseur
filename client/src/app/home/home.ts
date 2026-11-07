import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { HeroContactURL, HeroTechnologyStack } from '@ervum/constants';

import { ButtonComponent } from '../shared/components/standalone/button/button';
import { ContainerComponent } from '../shared/components/standalone/container/container';

import { SlideUpDownDirective } from '../shared/directives/slide-up-down/slide-up-down.directive';
import { TypewriterDirective } from '../shared/directives/typewriter/typewriter.directive';

import { AuthenticationService } from '../core/services/authentication/authentication';
import { InterfaceService } from '../core/services/interface/interface';
import { NavigationService } from '../core/services/navigation/navigation';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,

    ButtonComponent,
    ContainerComponent,

    SlideUpDownDirective,
    TypewriterDirective
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly NavigationService: NavigationService = inject(NavigationService);
  private readonly AuthenticationService: AuthenticationService = inject(AuthenticationService);
  public readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public readonly TechnologyStack: string[] = HeroTechnologyStack;

  public HandlePrimaryAction(): void {
    const TargetRoute: string = this.AuthenticationService.IsLoggedIn()
      ? 'profile'
      : 'authentication';

    this.NavigationService.NavigateWithAnimation(TargetRoute);
  }

  public HandleSecondaryAction(): void {
    if (!isPlatformBrowser(this.PlatformID)) return;

    window.location.href = HeroContactURL;
  }
}
