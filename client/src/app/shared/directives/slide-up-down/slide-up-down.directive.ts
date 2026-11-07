import { Directive, ElementRef, OnInit, OnDestroy, inject, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Nullable, SlideStateType } from '@ervum/types';
import { RouteTransitionDurationMilliseconds, RouteTransitionEasing } from '@ervum/constants';

import { InterfaceService } from '../../../core/services/interface/interface';



@Directive({
  selector: '[FancySlideUpDown]',
  standalone: true
})
export class SlideUpDownDirective implements OnInit, OnDestroy {
  private readonly ElementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly PlatformID: object = inject(PLATFORM_ID);

  private HasPlayedOut: boolean = false;
  private CurrentAnimation: Nullable<Animation> = null;

  constructor() {
    effect((): void => {
      const Request: Nullable<string> = this.InterfaceService.RouteTransitionRequest();

      if (Request !== null) {
        this.HasPlayedOut = true;
        this.PlayAnimation('Out');
      } else if (this.HasPlayedOut && (Request === null)) {
        this.HasPlayedOut = false;
        this.PlayAnimation('In');
      }
    });
  }

  public ngOnInit(): void {
    const Element: HTMLElement = this.ElementRef.nativeElement;

    if (!this.InterfaceService.IsAppInitialized) {
      this.InterfaceService.IsAppInitialized = true;
      Element.style.transform = 'translateY(0)';
      Element.style.opacity = '1';
    } else {
      this.PlayAnimation('In');
    }
  }

  public ngOnDestroy(): void {
    this.CurrentAnimation?.cancel();
    this.CurrentAnimation = null;
  }

  /**
   * Plays the slide animation via the native Web Animations API.
   * @param State The animation state ('In' or 'Out').
   */
  private PlayAnimation(State: SlideStateType): void {
    if (!isPlatformBrowser(this.PlatformID)) return;

    const Element: HTMLElement = this.ElementRef.nativeElement;
    if (typeof Element.animate !== 'function') return;

    this.CurrentAnimation?.cancel();

    const FromKeyframe: Keyframe = (State === 'In')
      ? { transform: 'translateY(100vh)', opacity: 0 }
      : { transform: 'translateY(0)', opacity: 1 };
    const ToKeyframe: Keyframe = (State === 'In')
      ? { transform: 'translateY(0)', opacity: 1 }
      : { transform: 'translateY(100vh)', opacity: 0 };

    this.CurrentAnimation = Element.animate([FromKeyframe, ToKeyframe], {
      duration: RouteTransitionDurationMilliseconds,
      easing:   RouteTransitionEasing,
      fill:     'forwards',
    });
  }
}
