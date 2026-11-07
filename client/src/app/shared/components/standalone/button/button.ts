import { Component, EventEmitter, Output, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges, inject, input, signal, computed, type Signal, type WritableSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Nullable, Undefinable, FancyUIElementTypeType, FancyUIElementStyleType, FancyButtonIconStateType, NGStylesType } from '@ervum/types';

import { ContainerComponent } from '../container/container';

import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';
import { GetIconVariantStyles } from '../../../utilities/icons';
import { InterfaceService } from '../../../../core/services/interface/interface';



@Component({
  selector: 'FancyButton',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    TypewriterDirective
  ],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  host: {
    '[class.FancyButton--Primary]': 'EffectiveType() === "Primary"',
    '[class.FancyButton--Secondary]': 'EffectiveType() === "Secondary"'
  }
})
export class ButtonComponent implements OnInit, OnChanges {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  // #region Configuration & State

  private EntryIsQueued: boolean = false;
  private ExitIsQueued: boolean = false;

  public readonly IconStatus: WritableSignal<FancyButtonIconStateType> = signal<FancyButtonIconStateType>('AtCenter');

  private Observer!: ResizeObserver;

  // #endregion

  // #region Logic & Helpers

  /**
   * Determines the UI theme.
   */
  private GetUIType(): boolean {
    return ((this.EffectiveType()) === 'Primary');
  }

  private GetTypeClass(): Record<string, boolean> {
    const UIType: boolean = this.GetUIType();

    return {
      'FancyButton--Primary':        UIType,
      'FancyButton--Secondary':      !UIType,
      'FancyButton--Backgroundless': ((this.Style()) === 'Backgroundless'),
      'FancyButton--Accent':         ((this.Style()) === 'Accent'),
    };
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

  // #endregion

  // #region Style & Class Getters

  /** Inline styles for the normal wrapper. */
  public get GetWrapperStyles(): NGStylesType {
    return { };
  }

  public get GetIconStyles(): NGStylesType {
    const IconValue: Nullable<string> = this.Icon();

    if (!IconValue) {
      return { };
    }

    return GetIconVariantStyles(IconValue);
  }

  public GetWrapperClasses(): Record<string, boolean> {
    return {
      ...(this.GetTypeClass()),

      'FancyButton--Centered': ((this.Centered()) === true),
    };
  }

  public GetButtonClasses(): Record<string, boolean> {
    return {
      ...(this.GetTypeClass()),
    };
  }

  public GetIconClasses(): Record<string, boolean> {
    const CurrentStatus: FancyButtonIconStateType = this.IconStatus();

    return {
      ...(this.GetTypeClass()),

      'FancyButton-Icon--Entering':  (CurrentStatus === 'Entering'),
      'FancyButton-Icon--Exiting':   (CurrentStatus === 'Exiting'),
      'FancyButton-Icon--OffScreen': (CurrentStatus === 'OffScreen'),
    };
  }

  // #endregion

  // #region Inputs

  public BorderSpacing: InputSignal<Nullable<number>> = input<Nullable<number>>(0.03);

  public Padding: InputSignal<Nullable<number>> = input<Nullable<number>>(-3.0);

  public Label: InputSignal<Nullable<string>> = input<Nullable<string>>('');

  public Icon: InputSignal<Nullable<string>> = input<Nullable<string>>('arrow');

  public HasIcon: InputSignal<boolean> = input<boolean>(true);

  /** The global interface type signal. */
  private GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;

  /** Local type override. */
  public Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);

  /** Visual style variant (`Standard` | `Backgroundless` | `Accent`). */
  public Style: InputSignal<FancyUIElementStyleType> = input<FancyUIElementStyleType>('Standard');

  /** The final type to use. */
  public EffectiveType: Signal<FancyUIElementTypeType> = computed((): FancyUIElementTypeType => (this.Type() ?? this.GlobalType()));

  public Centered: InputSignal<Nullable<boolean>> = input<Nullable<boolean>>(false);

  // #endregion

  // #region Outputs

  @Output() Hover: EventEmitter<void> = new EventEmitter<void>();
  @Output() Unhover: EventEmitter<void> = new EventEmitter<void>();

  @Output() Focus: EventEmitter<void> = new EventEmitter<void>();
  @Output() Unfocus: EventEmitter<void> = new EventEmitter<void>();

  @Output() Cancel: EventEmitter<void> = new EventEmitter<void>();

  @Output() Down: EventEmitter<void> = new EventEmitter<void>();
  @Output() Up: EventEmitter<void> = new EventEmitter<void>();

  @Output() KeyDown: EventEmitter<void> = new EventEmitter<void>();
  @Output() KeyUp: EventEmitter<void> = new EventEmitter<void>();

  @Output() Wheel: EventEmitter<void> = new EventEmitter<void>();

  // #endregion

  // #region Lifecycle & View Access

  @ViewChild('ButtonElement', { static: true }) ButtonElementReference!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
  }

  ngOnChanges(Changes: SimpleChanges): void {
  }

  // #endregion

  // #region Event Handlers

  public OnFocus(): void { this.Focus.emit(); }
  public OnUnfocus(): void { this.Unfocus.emit(); }

  public OnHover(): void { this.Hover.emit(); }

  public OnUnhover(): void {
    this.Unhover.emit();

    const CurrentStatus: FancyButtonIconStateType = this.IconStatus();

    if (CurrentStatus === 'OffScreen') {
      this.IconStatus.set('Entering');
    } else if (CurrentStatus === 'Exiting') {
      this.EntryIsQueued = true;
    }
  }

  public OnCancel(): void { this.Cancel.emit(); }

  public OnDown(Event: PointerEvent): void {
    this.Down.emit();

    const CurrentStatus: FancyButtonIconStateType = this.IconStatus();

    if (CurrentStatus === 'AtCenter') {
      this.ExitIsQueued = true;
      this.IconStatus.set('Exiting');
    } else if (CurrentStatus === 'Entering') {
      this.ExitIsQueued = true;
    }
  }

  public OnUp(Event: PointerEvent): void {
    this.Up.emit();

    (Event.currentTarget as HTMLElement)?.blur();

    const CurrentStatus: FancyButtonIconStateType = this.IconStatus();

    if (CurrentStatus === 'OffScreen') {
      this.IconStatus.set('Entering');
    } else if (CurrentStatus === 'Exiting') {
      this.EntryIsQueued = true;
    }
  }

  public OnKeyDown(Event: KeyboardEvent): void {
    this.KeyDown.emit();

    if ((Event.key === 'Enter') || (Event.key === ' ')) {
      this.Up.emit();
      Event.preventDefault();
    }
  }
  public OnKeyUp(): void { this.KeyUp.emit(); }

  public OnWheel(): void { this.Wheel.emit(); }

  // #endregion
}
