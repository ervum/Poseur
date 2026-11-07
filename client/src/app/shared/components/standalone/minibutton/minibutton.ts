import { Component, input, inject, signal, Output, EventEmitter, computed, HostListener, type Signal, type WritableSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { type Undefinable, type FancyButtonIconStateType, type NGStylesType } from '@ervum/types';

import { ContainerComponent } from '../container/container';

import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';
import { GetIconVariantStyles } from '../../../utilities/icons';
import { InterfaceService } from '../../../../core/services/interface/interface';



/**
 * A small, interactive button component that can display an icon or a text label.
 * It uses the FancyContainer for its background and adapts to the global interface theme.
 */
@Component({
  selector: 'FancyMinibutton',
  standalone: true,
  imports: [CommonModule, ContainerComponent, TypewriterDirective],
  templateUrl: './minibutton.html',
  styleUrl: './minibutton.scss',
  host: {
    '[class.Disabled]': 'Disabled()',
    '[class.Active]':   'Active()',
  }
})
export class MinibuttonComponent {
  /** The global interface service for theme synchronization. */
  public InterfaceService: InterfaceService = inject(InterfaceService);

  /** Whether the minibutton is disabled. */
  public Disabled: InputSignal<boolean> = input<boolean>(false);

  /** Whether the minibutton is in an active/selected state. */
  public Active: InputSignal<boolean> = input<boolean>(false);

  /** Optional text label to display inside the button. */
  public Label: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);

  /** Optional icon name or path to display inside the button. */
  public Icon: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);

  /** Whether the icon should play entering/exiting animations. */
  public Animated: InputSignal<boolean> = input<boolean>(true);

  /** Whether the label should use the typewriter transition directive. */
  public Typewriter: InputSignal<boolean> = input<boolean>(true);

  /** Tab index override. */
  public Tabindex: InputSignal<number> = input<number>(0);

  /** Computed effective tab index that becomes -1 if disabled. */
  public EffectiveTabindex: Signal<number> = computed((): number => (this.Disabled() ? -1 : this.Tabindex()));

  /** Current state of the icon animation. */
  public readonly IconStatus: WritableSignal<FancyButtonIconStateType> = signal<FancyButtonIconStateType>('AtCenter');

  @Output() public Activate: EventEmitter<void> = new EventEmitter<void>();

  public get GetIconStyles(): NGStylesType {
    const IconValue: Undefinable<string> = this.Icon();

    if (!IconValue) {
      return { };
    }

    return GetIconVariantStyles(IconValue);
  }

  /** Whether an entry animation is queued. */
  private EntryIsQueued: boolean = false;

  /** Whether an exit animation is queued. */
  private ExitIsQueued: boolean = false;

  @HostListener('click', ['$event'])
  public OnClick(Event: MouseEvent): void {
    if (this.Disabled()) {
      Event.preventDefault();
      Event.stopPropagation();

      return;
    }

    this.Activate.emit();
  }

  public OnDown(): void {
    if (this.Disabled() || !this.Animated()) return;

    const CurrentStatus: FancyButtonIconStateType = this.IconStatus();

    if (CurrentStatus === 'AtCenter') {
      this.ExitIsQueued = true;
      this.IconStatus.set('Exiting');
    } else if (CurrentStatus === 'Entering') {
      this.ExitIsQueued = true;
    }
  }

  public OnUp(): void {
    if (this.Disabled() || !this.Animated()) return;

    const CurrentStatus: FancyButtonIconStateType = this.IconStatus();

    if (CurrentStatus === 'OffScreen') {
      this.IconStatus.set('Entering');
    } else if (CurrentStatus === 'Exiting') {
      this.EntryIsQueued = true;
    }
  }

  public OnKeyDown(Event: KeyboardEvent): void {
    if (this.Disabled()) return;

    if ((Event.key === 'Enter') || (Event.key === ' ')) {
      Event.preventDefault();

      (Event.currentTarget as HTMLElement)?.click();
    }
  }

  public OnIconAnimationEnd(): void {
    const CurrentStatus: FancyButtonIconStateType = this.IconStatus();

    if (CurrentStatus === 'Exiting') {
      this.ExitIsQueued = false;
      this.IconStatus.set('OffScreen');

      if (this.EntryIsQueued) {
        this.EntryIsQueued = false;

        requestAnimationFrame((): void => {
          this.IconStatus.set('Entering');
        });
      }
    } else if (CurrentStatus === 'Entering') {
      this.EntryIsQueued = false;
      this.IconStatus.set('AtCenter');

      if (this.ExitIsQueued) {
        this.ExitIsQueued = false;

        requestAnimationFrame((): void => {
          this.IconStatus.set('Exiting');
        });
      }
    }
  }
}
