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

import { BackgroundMotionModeType, NGStylesType } from '@ervum/types';
import { BackgroundLayerDescriptors } from '@ervum/constants';

import { InterfaceService } from '../../../../../core/services/interface/interface';



@Component({
  selector: 'SpotlightBackgroundLayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spotlight.html',
  styleUrl: './spotlight.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpotlightBackgroundLayerComponent {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public readonly Motion: InputSignal<BackgroundMotionModeType> = input<BackgroundMotionModeType>(
    BackgroundLayerDescriptors.Spotlight.DefaultSettings.Motion
  );
  public readonly Intensity: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Spotlight.DefaultSettings.Intensity
  );
  public readonly Density: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Spotlight.DefaultSettings.Density
  );

  public readonly SpotlightStyles: Signal<NGStylesType> = computed((): NGStylesType => {
    const NormalizedIntensity: number = Math.max(0, Math.min(1, ((this.Intensity()) / 100)));
    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    const RadiusVw: number = Math.round(32 + ((1 - (NormalizedDensity * 0.45)) * 34));
    const HaloOpacity: number = IsLightTheme
      ? (0.08 + (NormalizedIntensity * 0.24))
      : (0.12 + (NormalizedIntensity * 0.36));
    const GrainOpacity: number = IsLightTheme
      ? (0.015 + (NormalizedDensity * 0.032))
      : (0.02 + (NormalizedDensity * 0.045));

    return {
      '--spotlight-radius':  `${RadiusVw}vmax`,
      '--spotlight-opacity': HaloOpacity.toFixed(3),
      '--grain-opacity':     GrainOpacity.toFixed(3),
    };
  });
}
