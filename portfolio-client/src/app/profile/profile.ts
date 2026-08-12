import { Component, inject, OnInit, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContainerComponent } from '../shared/components/standalone/container/container';
import { ButtonComponent } from '../shared/components/standalone/button/button';
import { MinibuttonComponent } from '../shared/components/standalone/minibutton/minibutton';

import { InterfaceService } from '../core/services/interface/interface';
import { NavigationService } from '../core/services/navigation/navigation';
import { AuthenticationService } from '../core/services/authentication/authentication';

import { TypewriterDirective } from '../shared/directives/typewriter/typewriter.directive';
import { SlideUpDownDirective } from '../shared/directives/slide-up-down/slide-up-down.directive';



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,

    ContainerComponent,
    ButtonComponent,
    MinibuttonComponent,

    TypewriterDirective,
    SlideUpDownDirective
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private readonly NavigationService: NavigationService = inject(NavigationService);
  public readonly InterfaceService: InterfaceService = inject(InterfaceService);
  public readonly AuthenticationService: AuthenticationService = inject(AuthenticationService);

  public readonly IsLoggedIn: Signal<boolean> = computed((): boolean => this.AuthenticationService.IsLoggedIn());

  ngOnInit(): void {
    if (!this.AuthenticationService.IsLoggedIn()) {
      this.HandleGoToAuthentication(); 
    }
  }

  public HandleSignOut(): void {
    this.AuthenticationService.SetLoggedIn(false);
    this.HandleGoToAuthentication(); 
  }

  public HandleGoToAuthentication(): void {
    this.NavigationService.NavigateWithAnimation('authentication');
  }
}
