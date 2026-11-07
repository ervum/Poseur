import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { RouteTransitionDurationMilliseconds } from '@ervum/constants';

import { InterfaceService } from '../services/interface/interface';



/**
 * Global guard that ensures exit animations play before a route change.
 * - For manual navigations (NavigateWithAnimation): allows immediately (animation already handled).
 * - For browser back/forward: triggers exit animation and delays the navigation by 800ms.
 */
export const AnimationGuard: CanDeactivateFn<unknown> = (): (boolean | Promise<boolean>) => {
  const Service: InterfaceService = inject(InterfaceService);

  if (Service.IsManualNavigation) {
    return true;
  }

  Service.RouteTransitionRequest.set('__browser_navigation__');

  return new Promise<boolean>((Resolve: ((Value: boolean) => (void))): void => {
    setTimeout((): void => {
      Service.RouteTransitionRequest.set(null);

      Resolve(true);
    }, RouteTransitionDurationMilliseconds);
  });
};
