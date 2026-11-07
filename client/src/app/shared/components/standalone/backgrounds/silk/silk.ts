import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
  effect,
  PLATFORM_ID,
  type InputSignal,
  type Signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { BackgroundMotionModeType, Nullable, Undefinable } from '@ervum/types';
import { BackgroundEvolvingTargetFPS, BackgroundLayerDescriptors } from '@ervum/constants';

import { InterfaceService } from '../../../../../core/services/interface/interface';
import { BackgroundPointerService } from '../../../../../core/services/background/background-pointer';
import {
  SimplexNoiseField,
  GenerateSilkWavePaths,
  type SilkWavePath
} from '../shared/procedural';



@Component({
  selector: 'SilkBackgroundLayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './silk.html',
  styleUrl: './silk.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SilkBackgroundLayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('EvolvingCanvas') public EvolvingCanvasReference?: ElementRef<HTMLCanvasElement>;

  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly IsBrowser: boolean = isPlatformBrowser(this.PlatformID);
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly PointerService: BackgroundPointerService = inject(BackgroundPointerService);

  public readonly Motion: InputSignal<BackgroundMotionModeType> = input<BackgroundMotionModeType>(
    BackgroundLayerDescriptors.Silk.DefaultSettings.Motion
  );
  public readonly Intensity: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Silk.DefaultSettings.Intensity
  );
  public readonly Density: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Silk.DefaultSettings.Density
  );

  private readonly Noise: SimplexNoiseField = new SimplexNoiseField(7731);
  private AnimationFrameID: Nullable<number> = null;
  private LastFrameTime: number = 0;
  private TimeAccumulator: number = 0;

  public readonly ViewWidth: number = 1440;
  public readonly ViewHeight: number = 900;

  public readonly WavePaths: Signal<SilkWavePath[]> = computed((): SilkWavePath[] => {
    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));

    return GenerateSilkWavePaths(this.Noise, this.ViewWidth, this.ViewHeight, NormalizedDensity, 0);
  });

  public readonly StageOpacity: Signal<number> = computed((): number => {
    const NormalizedIntensity: number = Math.max(0, Math.min(1, ((this.Intensity()) / 100)));
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    return IsLightTheme
      ? (0.09 + (NormalizedIntensity * 0.28))
      : (0.12 + (NormalizedIntensity * 0.42));
  });

  constructor() {
    effect((): void => {
      const ActiveMotion: BackgroundMotionModeType = this.Motion();
      this.Intensity();
      this.Density();
      this.InterfaceService.InterfaceType();

      if (!this.IsBrowser) return;

      if (ActiveMotion === 'Evolving') {
        queueMicrotask((): void => this.StartEvolvingLoop());
      } else {
        this.StopEvolvingLoop();
      }
    });
  }

  public ngAfterViewInit(): void {
    if (this.IsBrowser && ((this.Motion()) === 'Evolving')) {
      this.StartEvolvingLoop();
    }
  }

  public ngOnDestroy(): void {
    this.StopEvolvingLoop();
  }

  private StartEvolvingLoop(): void {
    if (!this.IsBrowser || ((this.AnimationFrameID) !== null)) return;

    const MinimumFrameInterval: number = (1000 / BackgroundEvolvingTargetFPS);

    const Tick: ((Now: number) => (void)) = (Now: number): void => {
      if ((this.Motion()) !== 'Evolving') {
        this.StopEvolvingLoop();

        return;
      }

      const PointerState = this.PointerService.GetSmoothedState();
      if ((!PointerState.IsHidden) && (!PointerState.IsScrolling) && ((Now - this.LastFrameTime) >= MinimumFrameInterval)) {
        const DeltaSeconds: number = (this.LastFrameTime > 0)
          ? Math.min(0.1, ((Now - this.LastFrameTime) / 1000))
          : (1 / BackgroundEvolvingTargetFPS);
        this.LastFrameTime = Now;
        this.TimeAccumulator += (DeltaSeconds * 0.65);
        this.RenderEvolvingFrame();
      }

      this.AnimationFrameID = requestAnimationFrame(Tick);
    };

    this.AnimationFrameID = requestAnimationFrame(Tick);
  }

  private StopEvolvingLoop(): void {
    if ((this.AnimationFrameID) !== null) {
      cancelAnimationFrame(this.AnimationFrameID);
      this.AnimationFrameID = null;
    }
  }

  private RenderEvolvingFrame(): void {
    const Canvas: Undefinable<HTMLCanvasElement> = this.EvolvingCanvasReference?.nativeElement;
    if (!Canvas) return;

    const Context: Nullable<CanvasRenderingContext2D> = Canvas.getContext('2d');
    if (!Context) return;

    if ((Canvas.width !== this.ViewWidth) || (Canvas.height !== this.ViewHeight)) {
      Canvas.width = this.ViewWidth;
      Canvas.height = this.ViewHeight;
    }

    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));
    const FrameWaves: SilkWavePath[] = GenerateSilkWavePaths(
      this.Noise,
      this.ViewWidth,
      this.ViewHeight,
      (NormalizedDensity * 0.85),
      this.TimeAccumulator
    );

    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');
    const Gradient: CanvasGradient = Context.createLinearGradient(0, 0, this.ViewWidth, 0);
    if (IsLightTheme) {
      Gradient.addColorStop(0, 'rgba(91, 71, 224, 0)');
      Gradient.addColorStop(0.25, 'rgba(91, 71, 224, 0.55)');
      Gradient.addColorStop(0.75, 'rgba(110, 142, 251, 0.55)');
      Gradient.addColorStop(1, 'rgba(91, 71, 224, 0)');
    } else {
      Gradient.addColorStop(0, 'rgba(139, 124, 255, 0)');
      Gradient.addColorStop(0.25, 'rgba(139, 124, 255, 0.58)');
      Gradient.addColorStop(0.75, 'rgba(196, 181, 253, 0.54)');
      Gradient.addColorStop(1, 'rgba(139, 124, 255, 0)');
    }

    Context.clearRect(0, 0, this.ViewWidth, this.ViewHeight);
    Context.strokeStyle = Gradient;

    for (const Wave of FrameWaves) {
      const PathObject: Path2D = new Path2D(Wave.PathData);
      Context.globalAlpha = (Wave.StrokeOpacityFactor * (Wave.IsAccent ? 0.95 : 0.52));
      Context.lineWidth = Wave.IsAccent ? 1.35 : 0.8;
      Context.stroke(PathObject);
    }

    Context.globalAlpha = 1;
  }
}
