import { Component, EventEmitter, Output, inject, input, computed, model, type Signal, type WritableSignal, type ModelSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContainerComponent } from '../container/container';

import { FancyUIElementTypeType, HorizontalPositionType, Undefinable } from '@ervum/types';
import { InterfaceService } from '../../../../core/services/interface/interface';

import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';



@Component({
  selector: 'FancyCheckbox',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    TypewriterDirective
  ],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
  host: {
    '[class.FancyCheckbox--Primary]': 'EffectiveType() === "Primary"',
    '[class.FancyCheckbox--Secondary]': 'EffectiveType() === "Secondary"'
  }
})
export class CheckboxComponent {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public Checked: ModelSignal<boolean> = model(false);
  
  /** The global interface type signal. */
  private GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;

  /** Local type override. */
  public Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);

  /** The final type to use. */
  public EffectiveType: Signal<FancyUIElementTypeType> = computed(() => (this.Type() ?? this.GlobalType()));
  
  public Label: InputSignal<string> = input('');
  public LabelPosition: InputSignal<HorizontalPositionType> = input<HorizontalPositionType>('Right');
  
  @Output() CheckedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public Toggle(): void {
    this.Checked.set(!(this.Checked()));
    this.CheckedChange.emit(this.Checked());
  }
}

