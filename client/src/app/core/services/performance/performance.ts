import { Injectable, Inject, PLATFORM_ID, signal, type WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Nullable } from '@ervum/types';
import { ReducedEffectsFrameBudgetMilliseconds, ReducedEffectsProbeFrameCount, SoftwareRendererSignatures } from '@ervum/constants';

const EffectsSessionStorageKey: string = 'Interface-Effects';



@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly IsBrowser: boolean;

  /** Whether reduced visual effects mode is active (software renderer, slow frame budget, or reduced-motion preference). */
  public readonly IsReducedEffects: WritableSignal<boolean> = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private readonly PlatformID: object) {
    this.IsBrowser = isPlatformBrowser(this.PlatformID);

    if (!this.IsBrowser) return;

    this.InitializeEffectsTier();
  }

  private InitializeEffectsTier(): void {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.EnableReducedEffects(false);

      return;
    }

    try {
      const CachedTier: Nullable<string> = sessionStorage.getItem(EffectsSessionStorageKey);

      if (CachedTier === 'Reduced') {
        this.EnableReducedEffects(false);

        return;
      }

      if (CachedTier === 'Full') {
        return;
      }
    } catch {
      // Ignore storage access errors
    }

    if (this.HasSoftwareWebGLRenderer()) {
      this.EnableReducedEffects(true);

      return;
    }

    this.ScheduleFrameBudgetProbe();
  }

  /** Enables the reduced-effects tier and applies `.Effects--Reduced` to `:root`. */
  public EnableReducedEffects(Persist: boolean = true): void {
    this.IsReducedEffects.set(true);

    if (this.IsBrowser) {
      document.documentElement.classList.add('Effects--Reduced');

      if (Persist) {
        this.PersistTier('Reduced');
      }
    }
  }

  private PersistTier(Tier: ('Full' | 'Reduced')): void {
    try {
      sessionStorage.setItem(EffectsSessionStorageKey, Tier);
    } catch {
      // Ignore storage access errors
    }
  }

  /** Inspects WebGL renderer strings to immediately detect software / CPU rasterizers. */
  private HasSoftwareWebGLRenderer(): boolean {
    try {
      const Canvas: HTMLCanvasElement = document.createElement('canvas');
      const Context: Nullable<WebGLRenderingContext> = (
        (Canvas.getContext('webgl') as Nullable<WebGLRenderingContext>) ??
        (Canvas.getContext('experimental-webgl') as Nullable<WebGLRenderingContext>)
      );

      if (!Context) {
        return true;
      }

      const DebugExtension: Nullable<WEBGL_debug_renderer_info> = Context.getExtension('WEBGL_debug_renderer_info');
      const RawRenderer: string = String(
        DebugExtension
          ? Context.getParameter(DebugExtension.UNMASKED_RENDERER_WEBGL)
          : Context.getParameter(Context.RENDERER)
      ).toLowerCase();

      return SoftwareRendererSignatures.some((Signature: string): boolean => RawRenderer.includes(Signature));
    } catch {
      return false;
    }
  }

  /** Measures consecutive animation frame deltas to detect throttled or non-hardware-accelerated compositing. */
  private ScheduleFrameBudgetProbe(): void {
    const StartProbe: (() => (void)) = (): void => {
      const FrameDeltas: number[] = [];
      let LastTimestamp: number = performance.now();

      const SampleFrame: ((Timestamp: number) => (void)) = (Timestamp: number): void => {
        if ((this.IsReducedEffects())) return;

        if (document.visibilityState !== 'visible') {
          LastTimestamp = Timestamp;
          requestAnimationFrame(SampleFrame);

          return;
        }

        const Delta: number = (Timestamp - LastTimestamp);
        LastTimestamp = Timestamp;

        if ((Delta > 0) && (Delta < 500)) {
          FrameDeltas.push(Delta);
        }

        if ((FrameDeltas.length) < ReducedEffectsProbeFrameCount) {
          requestAnimationFrame(SampleFrame);

          return;
        }

        const SortedDeltas: number[] = [...FrameDeltas].sort((A: number, B: number): number => (A - B));
        const MedianDelta: number = SortedDeltas[Math.floor((SortedDeltas.length) / 2)];

        if (MedianDelta > ReducedEffectsFrameBudgetMilliseconds) {
          this.EnableReducedEffects(true);
        } else {
          this.PersistTier('Full');
        }
      };

      requestAnimationFrame((Timestamp: number): void => {
        LastTimestamp = Timestamp;
        requestAnimationFrame(SampleFrame);
      });
    };

    setTimeout(StartProbe, 250);
  }
}
