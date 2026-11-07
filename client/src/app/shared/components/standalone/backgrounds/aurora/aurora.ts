import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  inject,
  effect,
  untracked,
  input,
  computed,
  signal,
  TransferState,
  makeStateKey,
  ChangeDetectionStrategy,
  type InputSignal,
  type Signal,
  type WritableSignal,
  type StateKey
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import {
  Nullable,
  RGBColour,
  AuroraSphere,
  BackgroundAccentPaletteStop,
  BackgroundMotionModeType
} from '@ervum/types';
import {
  BackgroundAccentPalette,
  BackgroundLayerDescriptors
} from '@ervum/constants';

import { InterfaceService } from '../../../../../core/services/interface/interface';
import { PerformanceService } from '../../../../../core/services/performance/performance';



@Component({
  selector: 'AuroraBackgroundLayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aurora.html',
  styleUrl: './aurora.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuroraBackgroundLayerComponent implements OnInit {
  private static readonly SpheresKey: StateKey<AuroraSphere[]> =
    makeStateKey<AuroraSphere[]>('Aurora-Violet-Spheres');

  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly PerformanceService: PerformanceService = inject(PerformanceService);
  private readonly TransferState: TransferState = inject(TransferState);
  private readonly IsBrowser: boolean;

  public readonly Motion: InputSignal<BackgroundMotionModeType> = input<BackgroundMotionModeType>(
    BackgroundLayerDescriptors.Aurora.DefaultSettings.Motion
  );
  public readonly Intensity: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Aurora.DefaultSettings.Intensity
  );
  public readonly Density: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Aurora.DefaultSettings.Density
  );

  public readonly MinimumSize: InputSignal<number> = input<number>(14);
  public readonly MaximumSize: InputSignal<number> = input<number>(24);
  public readonly MinimumTop: InputSignal<number> = input<number>(4);
  public readonly MaximumTop: InputSignal<number> = input<number>(92);
  public readonly MinimumLeft: InputSignal<number> = input<number>(4);
  public readonly MaximumLeft: InputSignal<number> = input<number>(92);
  public readonly MinimumSpeed: InputSignal<number> = input<number>(-20);
  public readonly MaximumSpeed: InputSignal<number> = input<number>(20);
  public readonly MinimumRotationSpeed: InputSignal<number> = input<number>(-0.8);
  public readonly MaximumRotationSpeed: InputSignal<number> = input<number>(0.8);
  public readonly MinimumScaleSpeed: InputSignal<number> = input<number>(0.1);
  public readonly MaximumScaleSpeed: InputSignal<number> = input<number>(0.2);
  public readonly MinimumOpacity: InputSignal<number> = input<number>(0.45);
  public readonly MaximumOpacity: InputSignal<number> = input<number>(0.82);
  public readonly MinimumAnimationDelay: InputSignal<number> = input<number>(0);
  public readonly MaximumAnimationDelay: InputSignal<number> = input<number>(4);

  public readonly AllSpheres: WritableSignal<AuroraSphere[]> = signal<AuroraSphere[]>([]);

  public readonly VisibleSphereCount: Signal<number> = computed((): number => {
    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));

    return Math.max(2, Math.min(8, Math.round(2 + (NormalizedDensity * 6))));
  });

  public readonly ActiveSpheres: Signal<AuroraSphere[]> = computed((): AuroraSphere[] => {
    return this.AllSpheres().slice(0, this.VisibleSphereCount());
  });

  public readonly StageOpacityScale: Signal<number> = computed((): number => {
    const NormalizedIntensity: number = Math.max(0, Math.min(1, ((this.Intensity()) / 100)));

    return (0.25 + (NormalizedIntensity * 0.95));
  });

  constructor(@Inject(PLATFORM_ID) private readonly PlatformID: object) {
    this.IsBrowser = isPlatformBrowser(this.PlatformID);

    effect((): void => {
      this.InterfaceService.InterfaceType();
      this.PerformanceService.IsReducedEffects();

      const CurrentSpheres: AuroraSphere[] = untracked((): AuroraSphere[] => this.AllSpheres());
      if ((CurrentSpheres.length) > 0) {
        this.RegenerateGradients(CurrentSpheres);
      }
    });
  }

  public ngOnInit(): void {
    const SavedSpheres: Nullable<AuroraSphere[]> = this.TransferState.get(
      AuroraBackgroundLayerComponent.SpheresKey,
      null
    );

    if (SavedSpheres && ((SavedSpheres.length) >= 8)) {
      this.AllSpheres.set(SavedSpheres);
    } else {
      const Generated: AuroraSphere[] = this.GenerateSpheres(8);
      this.AllSpheres.set(Generated);

      if (!this.IsBrowser) {
        this.TransferState.set(AuroraBackgroundLayerComponent.SpheresKey, Generated);
      }
    }
  }

  private GenerateSpheres(MaximumPoolCount: number): AuroraSphere[] {
    const Pool: AuroraSphere[] = [];

    for (let Index: number = 0; Index < MaximumPoolCount; Index++) {
      Pool.push({
        Styles: {
          '--sphere-opacity':       `${this.RandomBetween(this.MinimumOpacity(), this.MaximumOpacity()).toFixed(3)}`,
          '--sphere-speed':         `${this.RandomBetween(this.MinimumSpeed(), this.MaximumSpeed()).toFixed(2)}`,
          '--sphere-rotationspeed': `${this.RandomBetween(this.MinimumRotationSpeed(), this.MaximumRotationSpeed()).toFixed(3)}`,
          '--sphere-scalespeed':    `${this.RandomBetween(this.MinimumScaleSpeed(), this.MaximumScaleSpeed()).toFixed(3)}`,
          'animation-delay':        `${this.RandomBetween(this.MinimumAnimationDelay(), this.MaximumAnimationDelay()).toFixed(2)}s`,
          'top':                    `${this.RandomBetween(this.MinimumTop(), this.MaximumTop()).toFixed(2)}%`,
          'left':                   `${this.RandomBetween(this.MinimumLeft(), this.MaximumLeft()).toFixed(2)}%`,
          'width':                  `${this.RandomBetween(this.MinimumSize(), this.MaximumSize()).toFixed(2)}vw`,
          'height':                 `${this.RandomBetween(this.MinimumSize(), this.MaximumSize()).toFixed(2)}vw`,
          'background':             this.GenerateRandomGradient(),
          'border-radius':          this.GetRandomRadius(),
        },
      });
    }

    return Pool;
  }

  private GetRandomRadius(): string {
    return `${this.RandomBetween(10, 50).toFixed(2)}cqmin`;
  }

  private RegenerateGradients(SourceSpheres: AuroraSphere[] = untracked((): AuroraSphere[] => this.AllSpheres())): void {
    const Updated: AuroraSphere[] = SourceSpheres.map((Sphere: AuroraSphere): AuroraSphere => ({
      Styles: {
        ...(Sphere.Styles),
        'background': this.GenerateRandomGradient(),
      },
    }));

    this.AllSpheres.set(Updated);
  }

  private RandomBetween(Minimum: number, Maximum: number): number {
    return ((Math.random() * (Maximum - Minimum)) + Minimum);
  }

  private HSLToRGB(H: number, S: number, L: number): RGBColour {
    S /= 100;
    L /= 100;

    const k: ((n: number) => (number)) = (n: number): number => ((n + (H / 30)) % 12);
    const a: number = (S * Math.min(L, (1 - L)));
    const f: ((n: number) => (number)) = (n: number): number => (L - (a * Math.max(-1, Math.min((k(n) - 3), Math.min((9 - k(n)), 1)))));

    return {
      R: Math.round(255 * f(0)),
      G: Math.round(255 * f(8)),
      B: Math.round(255 * f(4)),
    };
  }

  /** Picks a Lumina/Obsidian violet-indigo tone from the canonical palette with slight organic variation. */
  private RandomBrandColour(): RGBColour {
    const BaseStop: BackgroundAccentPaletteStop = BackgroundAccentPalette[Math.floor(Math.random() * (BackgroundAccentPalette.length))];
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    const Hue: number = ((BaseStop.Hue + this.RandomBetween(-6, 6) + 360) % 360);
    const Saturation: number = Math.max(48, Math.min(96, (BaseStop.Saturation + this.RandomBetween(-8, 8))));
    const TargetLightness: number = IsLightTheme ? BaseStop.LightnessLight : BaseStop.LightnessDark;
    const Lightness: number = Math.max(38, Math.min(86, (TargetLightness + this.RandomBetween(-6, 6))));

    return this.HSLToRGB(Hue, Saturation, Lightness);
  }

  private RGBA(Colour: RGBColour, Opacity: number): string {
    return `rgba(${Colour.R}, ${Colour.G}, ${Colour.B}, ${Opacity.toFixed(2)})`;
  }

  private GenerateRandomGradient(): string {
    const IsReduced: boolean = this.PerformanceService.IsReducedEffects();
    const Roll: number = Math.random();

    const Colour1: RGBColour = this.RandomBrandColour();
    const Colour2: RGBColour = this.RandomBrandColour();
    const Opacity1: number = this.RandomBetween(0.68, 0.96);
    const Opacity2: number = this.RandomBetween(0.65, 0.92);

    const Position1: number = ((this.RandomBetween(22, 42)) | 0);
    const Position2: number = ((this.RandomBetween(52, 72)) | 0);
    const Position3: number = ((this.RandomBetween(60, 80)) | 0);

    // Under reduced effects mode (no CSS filter: blur(50px)), use soft multi-stop radial gradients
    if (IsReduced) {
      return (
        `radial-gradient(circle at ${Position1}% ${Position1}%, ${this.RGBA(Colour1, (Opacity1 * 0.72))} 0%, ${this.RGBA(Colour1, (Opacity1 * 0.28))} 36%, transparent ${Position2}%), ` +
        `radial-gradient(circle at ${Position3}% ${100 - Position3}%, ${this.RGBA(Colour2, (Opacity2 * 0.68))} 0%, ${this.RGBA(Colour2, (Opacity2 * 0.24))} 38%, transparent ${Position3}%)`
      );
    }

    if (Roll < 0.5) {
      return (
        `radial-gradient(circle at ${Position1}% ${Position1}%, ${this.RGBA(Colour1, Opacity1)}, transparent ${Position2}%), ` +
        `radial-gradient(circle at ${Position3}% ${100 - Position3}%, ${this.RGBA(Colour2, Opacity2)}, transparent ${Position3}%)`
      );
    }

    if (Roll < 0.8) {
      const Angle: number = ((this.RandomBetween(0, 360)) | 0);

      return `conic-gradient(from ${Angle}deg, ${this.RGBA(Colour1, Opacity1)}, ${this.RGBA(Colour2, Opacity2)}, ${this.RGBA(Colour1, Opacity1)})`;
    }

    const Colour3: RGBColour = this.RandomBrandColour();
    const Opacity3: number = this.RandomBetween(0.6, 0.88);

    return (
      `radial-gradient(circle at ${Position1}% ${Position1}%, ${this.RGBA(Colour1, Opacity1)}, transparent ${Position2}%), ` +
      `radial-gradient(circle at ${Position3}% ${Position1}%, ${this.RGBA(Colour2, Opacity2)}, transparent ${Position3}%), ` +
      `radial-gradient(circle at ${100 - Position1}% ${100 - Position1}%, ${this.RGBA(Colour3, Opacity3)}, transparent ${Position2}%)`
    );
  }
}
