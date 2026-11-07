import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { RouteTransitionDurationMilliseconds } from '@ervum/constants';

import { InterfaceService } from '../interface/interface';



@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private Router: Router = inject(Router);
  private InterfaceService: InterfaceService = inject(InterfaceService);

  /**
   * Navigates to the target route after triggering an exit animation.
   * @param Target The target route (e.g., 'home', 'authentication/recovery').
   */
  public NavigateWithAnimation(Target: string): void {
    const CurrentPath: string = this.Router.url.split('?')[0];
    const NormalizedTarget: string = (Target.startsWith('/') ? Target.substring(1) : Target);
    const TargetPath: string = `/${NormalizedTarget}`;

    if ((CurrentPath === TargetPath) || ((NormalizedTarget === 'home') && (CurrentPath === '/'))) return;

    this.InterfaceService.IsManualNavigation = true;

    this.InterfaceService.RouteTransitionRequest.set(NormalizedTarget);

    setTimeout((): void => {
      this.InterfaceService.RouteTransitionRequest.set(null);

      this.Router.navigate([TargetPath]).then((): void => {
        this.InterfaceService.IsManualNavigation = false;
      });
    }, RouteTransitionDurationMilliseconds);
  }
}
