import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  type InputSignal,
  type Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  type FancyIconNameType,
  type FancyIconVariantType,
  type NGStylesType
} from '@ervum/types';

import { GetIconVariantStyles } from '../../../utilities/icons';



@Component({
  selector: 'FancyIcon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FancyIconComponent {
  public readonly Name: InputSignal<FancyIconNameType> = input.required<FancyIconNameType>();
  public readonly Variant: InputSignal<FancyIconVariantType> = input<FancyIconVariantType>('Stroked');
  public readonly Size: InputSignal<number | string> = input<number | string>(16);
  public readonly AriaLabel: InputSignal<string> = input<string>('');

  public readonly PixelSize: Signal<string> = computed((): string => {
    const RawSize: number | string = this.Size();
    if (typeof RawSize === 'number') {
      return `${RawSize}px`;
    }

    return String(RawSize);
  });

  public readonly IconStyles: Signal<NGStylesType> = computed((): NGStylesType => {
    const SizeValue: string = this.PixelSize();

    return {
      ...(GetIconVariantStyles(this.Name())),
      'width':  SizeValue,
      'height': SizeValue,
    };
  });
}
