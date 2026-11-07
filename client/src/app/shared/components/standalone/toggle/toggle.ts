import { Component, EventEmitter, Output, inject, input, computed, model, type Signal, type WritableSignal, type ModelSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { type FancyUIElementTypeType, type HorizontalPositionType, type Undefinable } from '@ervum/types';

import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';

import { InterfaceService } from '../../../../core/services/interface/interface';



@Component({
  selector: 'FancyToggle',
  standalone: true,
  imports: [
    CommonModule,

    TypewriterDirective
  ],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
  host: {
    '[class.FancyToggle--Primary]':   'EffectiveType() === "Primary"',
    '[class.FancyToggle--Secondary]': 'EffectiveType() === "Secondary"',
    '[class.FancyToggle--Checked]':   'Checked()',
    '[class.FancyToggle--Disabled]':  'Disabled()',
  }
})
export class ToggleComponent {
  @Output() public CheckedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public Checked: ModelSignal<boolean> = model<boolean>(false);
  public Disabled: InputSignal<boolean> = input<boolean>(false);

  private GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;
  public Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);
  public EffectiveType: Signal<FancyUIElementTypeType> = computed((): FancyUIElementTypeType => (this.Type() ?? this.GlobalType()));

  public Label: InputSignal<string> = input<string>('');
  public LabelPosition: InputSignal<HorizontalPositionType> = input<HorizontalPositionType>('Right');

  public Toggle(): void {
    if (this.Disabled()) return;

    this.Checked.set(!(this.Checked()));
    this.CheckedChange.emit(this.Checked());
  }
}
