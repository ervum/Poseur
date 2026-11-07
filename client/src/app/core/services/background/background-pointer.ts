import { Injectable, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { type Nullable } from '@ervum/types';
import {
  BackgroundPointerSmoothingFactor,
  BackgroundScrollDebounceMilliseconds,
  BackgroundIdleTimeoutMilliseconds
} from '@ervum/constants';

import { PerformanceService } from '../performance/performance';
import { BackgroundService } from './background';



export interface BackgroundSmoothedPointerState {
  readonly X:              number;
  readonly Y:              number;
  readonly Distance:       number;
  readonly Angle:          number;
  readonly NormalizedX01:  number;
  readonly NormalizedY01:  number;
  readonly ViewportWidth:  number;
  readonly ViewportHeight: number;
  readonly IsScrolling:    boolean;
  readonly IsIdle:         boolean;
  readonly IsHidden:       boolean;
};



@Injectable({
  providedIn: 'root'
})
export class BackgroundPointerService {
  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly IsBrowser: boolean = isPlatformBrowser(this.PlatformID);
  private readonly PerformanceService: PerformanceService = inject(PerformanceService);
  private readonly BackgroundService: BackgroundService = inject(BackgroundService);

  private HostElement: Nullable<HTMLElement> = null;
  private ViewportResizeObserver: Nullable<ResizeObserver> = null;

  private ViewportWidth: number = 1440;
  private ViewportHeight: number = 900;

  private RawX: number = 0;
  private RawY: number = 0;

  private SmoothedX: number = 0;
  private SmoothedY: number = 0;
  private SmoothedDistance: number = 0;
  private SmoothedAngle: number = 0;

  private LastWrittenX: number = -999;
  private LastWrittenY: number = -999;
  private LastWrittenAngle: number = -999;

  private AnimationFrameID: Nullable<number> = null;
  private IsRenderLoopActive: boolean = false;
  private IsPageScrolling: boolean = false;
  private IsPageIdle: boolean = false;
  private IsPageHidden: boolean = false;

  private ScrollDebounceTimeoutID: number = 0;
  private IdleTimeoutID: number = 0;

  private IsPointerListenerAttached: boolean = false;
  private IsLifecycleListenerAttached: boolean = false;

  private readonly BoundPointerMoveHandler: ((Event: PointerEvent) => (void));
  private readonly BoundScrollHandler: (() => (void));
  private readonly BoundVisibilityHandler: (() => (void));

  constructor() {
    this.BoundPointerMoveHandler = (Event: PointerEvent): void => this.OnPointerMove(Event);
    this.BoundScrollHandler = (): void => this.OnWindowScroll();
    this.BoundVisibilityHandler = (): void => this.OnVisibilityChange();

    effect((): void => {
      const NeedsPointer: boolean = this.BackgroundService.HasInteractivePointerLayer();
      const IsReduced: boolean = this.PerformanceService.IsReducedEffects();

      if (!this.IsBrowser) return;

      if (NeedsPointer && !IsReduced && (this.HostElement) && !this.HasCoarsePointer()) {
        this.AttachPointerListener();
      } else {
        this.DetachPointerListener();
      }
    });
  }

  public AttachHost(Element: HTMLElement): void {
    if (!this.IsBrowser) return;

    this.HostElement = Element;
    this.InitializeViewportObserver();
    this.AttachLifecycleListeners();

    if (
      this.BackgroundService.HasInteractivePointerLayer() &&
      !this.PerformanceService.IsReducedEffects() &&
      !this.HasCoarsePointer()
    ) {
      this.AttachPointerListener();
      this.StartRenderLoop();
    }

    this.ResetIdleTimer();
  }

  public DetachHost(): void {
    this.StopRenderLoop();
    this.DetachPointerListener();
    this.DetachLifecycleListeners();

    if (this.ViewportResizeObserver) {
      this.ViewportResizeObserver.disconnect();
      this.ViewportResizeObserver = null;
    }

    if (this.ScrollDebounceTimeoutID) {
      window.clearTimeout(this.ScrollDebounceTimeoutID);
      this.ScrollDebounceTimeoutID = 0;
    }

    if (this.IdleTimeoutID) {
      window.clearTimeout(this.IdleTimeoutID);
      this.IdleTimeoutID = 0;
    }

    this.HostElement = null;
  }

  public GetSmoothedState(): BackgroundSmoothedPointerState {
    return {
      X:              (this.SmoothedX),
      Y:              (this.SmoothedY),
      Distance:       (this.SmoothedDistance),
      Angle:          (this.SmoothedAngle),
      NormalizedX01:  (((this.SmoothedX) + 1) * 0.5),
      NormalizedY01:  (((this.SmoothedY) + 1) * 0.5),
      ViewportWidth:  (this.ViewportWidth),
      ViewportHeight: (this.ViewportHeight),
      IsScrolling:    (this.IsPageScrolling),
      IsIdle:         (this.IsPageIdle),
      IsHidden:       (this.IsPageHidden),
    };
  }

  private HasCoarsePointer(): boolean {
    if (!this.IsBrowser || !(window.matchMedia)) {
      return false;
    }

    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  private InitializeViewportObserver(): void {
    if (!this.IsBrowser) return;

    this.ViewportWidth = Math.max(1, (document.documentElement.clientWidth) || (window.innerWidth) || 1440);
    this.ViewportHeight = Math.max(1, (document.documentElement.clientHeight) || (window.innerHeight) || 900);

    if ((typeof ResizeObserver !== 'undefined') && !(this.ViewportResizeObserver)) {
      this.ViewportResizeObserver = new ResizeObserver((Entries: ResizeObserverEntry[]): void => {
        for (const Entry of Entries) {
          const Width: number = Entry.contentRect.width;
          const Height: number = Entry.contentRect.height;

          if ((Width > 0) && (Height > 0)) {
            this.ViewportWidth = Width;
            this.ViewportHeight = Height;
          }
        }
      });

      this.ViewportResizeObserver.observe(document.documentElement);
    }
  }

  private AttachPointerListener(): void {
    if (!this.IsBrowser || (this.IsPointerListenerAttached)) return;

    window.addEventListener('pointermove', this.BoundPointerMoveHandler, { passive: true });
    this.IsPointerListenerAttached = true;
  }

  private DetachPointerListener(): void {
    if (!this.IsBrowser || !(this.IsPointerListenerAttached)) return;

    window.removeEventListener('pointermove', this.BoundPointerMoveHandler);
    this.IsPointerListenerAttached = false;
    this.StopRenderLoop();
  }

  private AttachLifecycleListeners(): void {
    if (!this.IsBrowser || (this.IsLifecycleListenerAttached)) return;

    window.addEventListener('scroll', this.BoundScrollHandler, { passive: true });
    document.addEventListener('visibilitychange', this.BoundVisibilityHandler, { passive: true });
    this.IsLifecycleListenerAttached = true;
  }

  private DetachLifecycleListeners(): void {
    if (!this.IsBrowser || !(this.IsLifecycleListenerAttached)) return;

    window.removeEventListener('scroll', this.BoundScrollHandler);
    document.removeEventListener('visibilitychange', this.BoundVisibilityHandler);
    this.IsLifecycleListenerAttached = false;
  }

  private OnPointerMove(Event: PointerEvent): void {
    this.RawX = ((((Event.clientX) / (this.ViewportWidth)) * 2) - 1);
    this.RawY = ((((Event.clientY) / (this.ViewportHeight)) * 2) - 1);

    this.ResetIdleTimer();

    if (!(this.IsRenderLoopActive) && !(this.IsPageScrolling) && !(this.IsPageHidden)) {
      this.StartRenderLoop();
    }
  }

  private OnWindowScroll(): void {
    this.IsPageScrolling = true;
    this.HostElement?.classList.add('Is-Scrolling');

    if (this.IsRenderLoopActive) {
      this.StopRenderLoop();
    }

    if (this.ScrollDebounceTimeoutID) {
      window.clearTimeout(this.ScrollDebounceTimeoutID);
    }

    this.ScrollDebounceTimeoutID = window.setTimeout((): void => {
      this.IsPageScrolling = false;
      this.HostElement?.classList.remove('Is-Scrolling');
      this.ResetIdleTimer();

      const DistanceToRaw: number = Math.hypot((this.RawX) - (this.SmoothedX), (this.RawY) - (this.SmoothedY));
      if (
        (DistanceToRaw > 0.005) &&
        !(this.IsRenderLoopActive) &&
        !(this.IsPageHidden) &&
        (this.IsPointerListenerAttached)
      ) {
        this.StartRenderLoop();
      }
    }, BackgroundScrollDebounceMilliseconds);
  }

  private OnVisibilityChange(): void {
    this.IsPageHidden = (document.hidden);

    if (this.IsPageHidden) {
      this.HostElement?.classList.add('Is-Hidden');
      this.StopRenderLoop();
    } else {
      this.HostElement?.classList.remove('Is-Hidden');
      this.ResetIdleTimer();

      if (this.IsPointerListenerAttached) {
        this.StartRenderLoop();
      }
    }
  }

  private ResetIdleTimer(): void {
    if (this.IsPageIdle) {
      this.IsPageIdle = false;
      this.HostElement?.classList.remove('Is-Idle');
    }

    if (this.IdleTimeoutID) {
      window.clearTimeout(this.IdleTimeoutID);
    }

    this.IdleTimeoutID = window.setTimeout((): void => {
      if (!(this.IsRenderLoopActive) && !(this.IsPageScrolling)) {
        this.IsPageIdle = true;
        this.HostElement?.classList.add('Is-Idle');
      }
    }, BackgroundIdleTimeoutMilliseconds);
  }

  private StartRenderLoop(): void {
    if (!this.IsBrowser || (this.IsRenderLoopActive) || !(this.HostElement)) return;

    this.IsRenderLoopActive = true;

    const Step: (() => (void)) = (): void => {
      if (!(this.IsRenderLoopActive)) return;

      this.UpdateSmoothedValues();
      const DidWrite: boolean = this.WriteCSSVariables();
      const DistanceToRaw: number = Math.hypot((this.RawX) - (this.SmoothedX), (this.RawY) - (this.SmoothedY));

      if (!DidWrite && (DistanceToRaw < 0.001)) {
        this.StopRenderLoop();

        return;
      }

      this.AnimationFrameID = requestAnimationFrame(Step);
    };

    this.AnimationFrameID = requestAnimationFrame(Step);
  }

  private StopRenderLoop(): void {
    this.IsRenderLoopActive = false;

    if ((this.AnimationFrameID) !== null) {
      cancelAnimationFrame(this.AnimationFrameID);
      this.AnimationFrameID = null;
    }
  }

  private UpdateSmoothedValues(): void {
    this.SmoothedX += (((this.RawX) - (this.SmoothedX)) * BackgroundPointerSmoothingFactor);
    this.SmoothedY += (((this.RawY) - (this.SmoothedY)) * BackgroundPointerSmoothingFactor);
    this.SmoothedDistance = Math.hypot(this.SmoothedX, this.SmoothedY);

    const TargetAngle: number = Math.atan2(this.SmoothedY, this.SmoothedX);
    let AngleDelta: number = (TargetAngle - (this.SmoothedAngle));
    AngleDelta -= (Math.round(AngleDelta / (2 * Math.PI)) * (2 * Math.PI));
    this.SmoothedAngle += (AngleDelta * BackgroundPointerSmoothingFactor);
  }

  private WriteCSSVariables(): boolean {
    if (!(this.HostElement)) return false;

    const DeltaX: number = Math.abs((this.SmoothedX) - (this.LastWrittenX));
    const DeltaY: number = Math.abs((this.SmoothedY) - (this.LastWrittenY));
    const DeltaAngle: number = Math.abs((this.SmoothedAngle) - (this.LastWrittenAngle));

    if ((DeltaX < 0.0001) && (DeltaY < 0.0001) && (DeltaAngle < 0.0001)) {
      return false;
    }

    this.LastWrittenX = this.SmoothedX;
    this.LastWrittenY = this.SmoothedY;
    this.LastWrittenAngle = this.SmoothedAngle;

    const NormalizedXPercent: number = (((this.SmoothedX) + 1) * 50);
    const NormalizedYPercent: number = (((this.SmoothedY) + 1) * 50);

    const Style: CSSStyleDeclaration = this.HostElement.style;
    Style.setProperty('--pointer-x', this.SmoothedX.toFixed(4));
    Style.setProperty('--pointer-y', this.SmoothedY.toFixed(4));
    Style.setProperty('--pointer-distance', this.SmoothedDistance.toFixed(4));
    Style.setProperty('--pointer-angle', this.SmoothedAngle.toFixed(4));
    Style.setProperty('--pointer-x-pct', `${NormalizedXPercent.toFixed(2)}%`);
    Style.setProperty('--pointer-y-pct', `${NormalizedYPercent.toFixed(2)}%`);
    Style.setProperty('--mouse-x', this.SmoothedX.toFixed(4));
    Style.setProperty('--mouse-y', this.SmoothedY.toFixed(4));
    Style.setProperty('--mouse-distance', this.SmoothedDistance.toFixed(4));
    Style.setProperty('--mouse-angle', this.SmoothedAngle.toFixed(4));

    return true;
  }
}
