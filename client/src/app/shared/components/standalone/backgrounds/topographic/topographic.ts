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
  GenerateTopographicContours,
  type TopographicContourPath
} from '../shared/procedural';



@Component({
  selector: 'TopographicBackgroundLayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topographic.html',
  styleUrl: './topographic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopographicBackgroundLayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('EvolvingCanvas') public EvolvingCanvasReference?: ElementRef<HTMLCanvasElement>;

  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly IsBrowser: boolean = isPlatformBrowser(this.PlatformID);
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly PointerService: BackgroundPointerService = inject(BackgroundPointerService);

  public readonly Motion: InputSignal<BackgroundMotionModeType> = input<BackgroundMotionModeType>(
    BackgroundLayerDescriptors.Topographic.DefaultSettings.Motion
  );
  public readonly Intensity: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Topographic.DefaultSettings.Intensity
  );
  public readonly Density: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Topographic.DefaultSettings.Density
  );

  private readonly Noise: SimplexNoiseField = new SimplexNoiseField(4091);
  private AnimationFrameID: Nullable<number> = null;
  private LastFrameTime: number = 0;
  private TimeAccumulator: number = 0;

  public readonly ViewWidth: number = 1440;
  public readonly ViewHeight: number = 900;

  public readonly Contours: Signal<TopographicContourPath[]> = computed((): TopographicContourPath[] => {
    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));

    return GenerateTopographicContours(
      this.Noise,
      this.ViewWidth,
      this.ViewHeight,
      NormalizedDensity,
      0
    );
  });

  public readonly StageOpacity: Signal<number> = computed((): number => {
    const NormalizedIntensity: number = Math.max(0, Math.min(1, ((this.Intensity()) / 100)));
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    return IsLightTheme
      ? (0.08 + (NormalizedIntensity * 0.28))
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
        this.TimeAccumulator += (DeltaSeconds * 0.18);
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
    const FrameContours: TopographicContourPath[] = GenerateTopographicContours(
      this.Noise,
      this.ViewWidth,
      this.ViewHeight,
      (NormalizedDensity * 0.78),
      this.TimeAccumulator
    );

    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');
    const IndexColour: string = IsLightTheme ? 'rgba(91, 71, 224, 0.62)' : 'rgba(139, 124, 255, 0.56)';
    const MinorColour: string = IsLightTheme ? 'rgba(91, 71, 224, 0.28)' : 'rgba(110, 142, 251, 0.24)';

    Context.clearRect(0, 0, this.ViewWidth, this.ViewHeight);
    Context.lineCap = 'round';
    Context.lineJoin = 'round';

    for (const Contour of FrameContours) {
      const Path2DObject: Path2D = new Path2D(Contour.PathData);
      Context.strokeStyle = Contour.IsIndexContour ? IndexColour : MinorColour;
      Context.lineWidth = Contour.IsIndexContour ? 1.45 : 0.85;
      Context.stroke(Path2DObject);
    }
  }
}
