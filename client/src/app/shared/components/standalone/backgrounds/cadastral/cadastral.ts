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
  GenerateCadastralParcels,
  type CadastralParcelShape
} from '../shared/procedural';



@Component({
  selector: 'CadastralBackgroundLayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cadastral.html',
  styleUrl: './cadastral.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadastralBackgroundLayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('EvolvingCanvas') public EvolvingCanvasReference?: ElementRef<HTMLCanvasElement>;

  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly IsBrowser: boolean = isPlatformBrowser(this.PlatformID);
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly PointerService: BackgroundPointerService = inject(BackgroundPointerService);

  public readonly Motion: InputSignal<BackgroundMotionModeType> = input<BackgroundMotionModeType>(
    BackgroundLayerDescriptors.Cadastral.DefaultSettings.Motion
  );
  public readonly Intensity: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Cadastral.DefaultSettings.Intensity
  );
  public readonly Density: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Cadastral.DefaultSettings.Density
  );

  public readonly ViewWidth: number = 1440;
  public readonly ViewHeight: number = 900;

  private AnimationFrameID: Nullable<number> = null;
  private LastFrameTime: number = 0;
  private TimeAccumulator: number = 0;

  public readonly Parcels: Signal<CadastralParcelShape[]> = computed((): CadastralParcelShape[] => {
    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));

    return GenerateCadastralParcels(this.ViewWidth, this.ViewHeight, NormalizedDensity, 916);
  });

  public readonly StageOpacity: Signal<number> = computed((): number => {
    const NormalizedIntensity: number = Math.max(0, Math.min(1, ((this.Intensity()) / 100)));
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    return IsLightTheme
      ? (0.08 + (NormalizedIntensity * 0.25))
      : (0.11 + (NormalizedIntensity * 0.36));
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
        this.TimeAccumulator += DeltaSeconds;
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

    const PointerState = this.PointerService.GetSmoothedState();
    const PointerViewX: number = (PointerState.NormalizedX01 * this.ViewWidth);
    const PointerViewY: number = (PointerState.NormalizedY01 * this.ViewHeight);
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    Context.clearRect(0, 0, this.ViewWidth, this.ViewHeight);

    const AllParcels: CadastralParcelShape[] = this.Parcels();
    for (let Index: number = 0; Index < (AllParcels.length); Index++) {
      const Parcel: CadastralParcelShape = AllParcels[Index];
      const PathObject: Path2D = new Path2D(Parcel.PathData);
      const DistanceToPointer: number = Math.hypot((Parcel.CentroidX - PointerViewX), (Parcel.CentroidY - PointerViewY));
      const ProximityBoost: number = Math.max(0, (1 - (DistanceToPointer / 290)));
      const ShimmerWave: number = (0.5 + (0.5 * Math.sin((this.TimeAccumulator * 0.9) + (Index * 0.37))));

      if (Parcel.IsAccentParcel || (ProximityBoost > 0.15)) {
        const FillAlpha: number = (((Parcel.IsAccentParcel ? 0.04 : 0) + (ProximityBoost * 0.08)) * (0.65 + (ShimmerWave * 0.35)));
        Context.fillStyle = IsLightTheme
          ? `rgba(91, 71, 224, ${FillAlpha.toFixed(3)})`
          : `rgba(139, 124, 255, ${FillAlpha.toFixed(3)})`;
        Context.fill(PathObject);
      }

      const StrokeAlpha: number = ((Parcel.IsMajorBlock ? 0.55 : 0.26) + (ProximityBoost * 0.36));
      Context.strokeStyle = IsLightTheme
        ? `rgba(91, 71, 224, ${StrokeAlpha.toFixed(3)})`
        : `rgba(139, 124, 255, ${StrokeAlpha.toFixed(3)})`;
      Context.lineWidth = Parcel.IsMajorBlock ? 1.35 : 0.75;
      Context.stroke(PathObject);
    }
  }
}
