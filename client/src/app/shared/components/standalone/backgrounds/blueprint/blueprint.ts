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
  selector: 'BlueprintBackgroundLayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blueprint.html',
  styleUrl: './blueprint.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlueprintBackgroundLayerComponent {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public readonly Motion: InputSignal<BackgroundMotionModeType> = input<BackgroundMotionModeType>(
    BackgroundLayerDescriptors.Blueprint.DefaultSettings.Motion
  );
  public readonly Intensity: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Blueprint.DefaultSettings.Intensity
  );
  public readonly Density: InputSignal<number> = input<number>(
    BackgroundLayerDescriptors.Blueprint.DefaultSettings.Density
  );

  public readonly GridStyles: Signal<NGStylesType> = computed((): NGStylesType => {
    const NormalizedIntensity: number = Math.max(0, Math.min(1, ((this.Intensity()) / 100)));
    const NormalizedDensity: number = Math.max(0, Math.min(1, ((this.Density()) / 100)));
    const IsLightTheme: boolean = ((this.InterfaceService.InterfaceType()) === 'Secondary');

    const MinorCellPixels: number = Math.round(52 - (NormalizedDensity * 30));
    const MajorCellPixels: number = (MinorCellPixels * 4);
    const StageOpacity: number = IsLightTheme
      ? (0.12 + (NormalizedIntensity * 0.34))
      : (0.14 + (NormalizedIntensity * 0.44));

    return {
      '--blueprint-minor-size': `${MinorCellPixels}px`,
      '--blueprint-major-size': `${MajorCellPixels}px`,
      '--blueprint-opacity':    StageOpacity.toFixed(3),
    };
  });
}
