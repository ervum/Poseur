import { Component, input, computed, inject, type Signal, type WritableSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Undefinable, FancyUIElementTypeType } from '@ervum/types';

import { InterfaceService } from '../../../../core/services/interface/interface';



@Component({
    selector: 'FancyContainer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './container.html',
    styleUrl: './container.scss',
    host: {
        '[class.FancyContainer--Primary]': 'EffectiveType() === "Primary"',
        '[class.FancyContainer--Secondary]': 'EffectiveType() === "Secondary"'
    }
})
export class ContainerComponent {
    private readonly InterfaceService: InterfaceService = inject(InterfaceService);

    /** The global interface type signal. */
    private GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;

    /** 
     * Local type override. 
     * Starts as undefined to detect if it was provided in the template.
     */
    public Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);

    /** 
     * The final type to use. 
     * Uses the local override if specified, otherwise follows the global theme.
     */
    public EffectiveType: Signal<FancyUIElementTypeType> = computed(() => this.Type() ?? this.GlobalType());
}

