import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
  type InputSignal,
  type Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackgroundAccentPaletteStop, BackgroundMotionModeType, NGStylesType } from '@ervum/types';
import { BackgroundAccentPalette, BackgroundLayerDescriptors } from '@ervum/constants';

import { InterfaceService } from '../../../../../core/services/interface/interface';



export interface MeshOrbDescriptor {
  readonly ID:     number;
  readonly Styles: NGStylesType;
};



@Component({
  selector: 'MeshBackgroundLayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mesh.html',
  styleUrl: './mesh.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeshBackgroundLayerComponent {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public readonly Motion: InputSignal<BackgroundMotionModeType> = input<BackgroundMotionModeType>(
    BackgroundLayerDescriptors.Mesh.DefaultSettings.Motion
  );
  public readonly Intensity: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Mesh.DefaultSettings.Intensity
  );
  public readonly Density: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Mesh.DefaultSettings.Density
  );

  private static readonly OrbAnchorPresets: readonly {
    Top:            number;
    Left:           number;
    SizeVw:         number;
    DelaySec:       number;
    DurationSec:    number;
    ParallaxFactor: number;
  }[] = [
    { Top: -12, Left: -8, SizeVw: 62, DelaySec: 0,   DurationSec: 28, ParallaxFactor: -18 },
    { Top: 28,  Left: 54, SizeVw: 58, DelaySec: -7,  DurationSec: 34, ParallaxFactor: 14 },
    { Top: 52,  Left: -6, SizeVw: 54, DelaySec: -13, DurationSec: 31, ParallaxFactor: -12 },
    { Top: -10, Left: 46, SizeVw: 50, DelaySec: -19, DurationSec: 36, ParallaxFactor: 16 },
    { Top: 44,  Left: 26, SizeVw: 60, DelaySec: -5,  DurationSec: 29, ParallaxFactor: -15 },
  ];

  public readonly StageOpacity: Signal<number> = computed((): number => {
    const NormalizedIntensity: number = Math.max(0, Math.min(1, ((this.Intensity()) / 100)));
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    return IsLightTheme
      ? (0.14 + (NormalizedIntensity * 0.34))
      : (0.22 + (NormalizedIntensity * 0.56));
  });

  public readonly Orbs: Signal<MeshOrbDescriptor[]> = computed((): MeshOrbDescriptor[] => {
    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));
    const Count: number = Math.max(2, Math.min(5, Math.round(2 + (NormalizedDensity * 3))));
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    const Result: MeshOrbDescriptor[] = [];

    for (let Index: number = 0; Index < Count; Index++) {
      const Preset = MeshBackgroundLayerComponent.OrbAnchorPresets[Index];
      const Stop: BackgroundAccentPaletteStop = BackgroundAccentPalette[Index % (BackgroundAccentPalette.length)];
      const CoreAlpha: number = IsLightTheme ? 0.24 : 0.32;
      const MidAlpha: number = IsLightTheme ? 0.10 : 0.14;

      Result.push({
        ID:     Index,
        Styles: {
          'top':                `${Preset.Top}%`,
          'left':               `${Preset.Left}%`,
          'width':              `${Preset.SizeVw}vw`,
          'height':             `${Preset.SizeVw}vw`,
          '--mesh-parallax':    `${Preset.ParallaxFactor}px`,
          'animation-delay':    `${Preset.DelaySec}s`,
          'animation-duration': `${Preset.DurationSec}s`,
          'background':
            `radial-gradient(circle at 50% 50%, ` +
            `rgba(${Stop.RGB.R}, ${Stop.RGB.G}, ${Stop.RGB.B}, ${CoreAlpha}) 0%, ` +
            `rgba(${Stop.RGB.R}, ${Stop.RGB.G}, ${Stop.RGB.B}, ${MidAlpha}) 38%, ` +
            `transparent 74%)`,
        },
      });
    }

    return Result;
  });
}
