import { Component, EventEmitter, OnInit, OnChanges, SimpleChanges, Output, inject, input, signal, computed, type Signal, type WritableSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Undefinable, FancyUIElementTypeType, FancyTextboxOrderType, FancyTextboxIconStateType, VerticalPositionType, FancyUIElementFocusStateType, StringBooleanType, Nullable, NGStylesType } from '@ervum/types';

import { ContainerComponent } from '../container/container';

import { InterfaceService } from '../../../../core/services/interface/interface';
import { GetIconVariantStyles } from '../../../utilities/icons';
import { TypewriterAnimator } from '../../../utilities/typewriter';



@Component({
  selector: 'FancyTextbox',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContainerComponent
  ],
  templateUrl: './textbox.html',
  styleUrl: './textbox.scss',
  host: {
    '[class.FancyTextbox--Primary]': 'EffectiveType() === "Primary"',
    '[class.FancyTextbox--Secondary]': 'EffectiveType() === "Secondary"'
  }
})
export class TextboxComponent implements OnInit, OnChanges {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  // #region Configuration & State

  private readonly AnimationDurationIn: number = 2000;
  private readonly AnimationDurationOut: number = 2000;

  /**
   * Configuration for animation states based on the boolean mode.
   */
  private readonly AnimationModes: Record<StringBooleanType, [FancyUIElementFocusStateType, FancyUIElementFocusStateType, number]> = {
    'True':  ['Unfocused', 'Unfocusing', (this.AnimationDurationOut)],
    'False': ['Focused', 'Focusing', (this.AnimationDurationIn)],
  };

  private FocusTimeoutID: Undefinable<ReturnType<typeof setTimeout>>;
  private AnimationStartTime: number = 0;

  public TextboxStyles: NGStylesType = { };

  public InputValue: string = '';
  public readonly FocusState: WritableSignal<FancyUIElementFocusStateType> = signal<FancyUIElementFocusStateType>('Unfocused');

  public IsVisible: boolean = false;
  public readonly DisplayedIcon: WritableSignal<Undefinable<string>> = signal<Undefinable<string>>(undefined);
  public QueuedIcon: Undefinable<string>;
  public readonly IconAnimationState: WritableSignal<FancyTextboxIconStateType> = signal<FancyTextboxIconStateType>('Idle');

  // #endregion

  // #region Style & Class Getters

  private get GetBaseClasses(): Record<string, boolean> {
    return {
      [`FancyTextbox--${this.EffectiveType()}`]: true,
    };
  }

  public get GetOrderClasses(): Record<string, boolean> {
    return {
      [`FancyTextbox--${this.Order()}`]: true,
    };
  }

  /** Class Getter for `.FancyTextbox-Icon-Container`. */
  public get GetIconContainerClasses(): Record<string, boolean> {
    return {
      ...(this.GetBaseClasses),
      ...(this.GetOrderClasses),
    };
  }

  /** Class Getter for `.FancyTextbox-Content`. */
  public get GetContentClasses(): Record<string, boolean> {
    return { };
  }

  /** Class Getter for `.FancyTextbox-Placeholder` and `.FancyTextbox-Border`. */
  public get GetOverlayClasses(): Record<string, boolean> {
    return {
      ...(this.GetBaseClasses),
      ...(this.GetOrderClasses),

      'FancyTextboxBorder--AnimationBelow': ((this.BorderAnimation()) === 'Below'),
    };
  }

  /** Class Getter for `.FancyTextbox` and `.FancyTextbox-Icon`. */
  public get GetInputClasses(): Record<string, boolean> {
    return {
      [`FancyTextbox--${this.EffectiveType()}`]: true,
      ...(this.GetOrderClasses),
    };
  }

  public get GetIconStyles(): NGStylesType {
    const CurrentIcon: Undefinable<string> = this.DisplayedIcon();

    if (!CurrentIcon) {
      return { };
    }

    return GetIconVariantStyles(CurrentIcon);
  }

  public get HasText(): boolean {
    return ((this.InputValue.length) > 0);
  }

  // #endregion

  // #region Logic & Helpers

  private Wait(ms: number): Promise<void> {
    return new Promise<void>((Resolve: () => void) => setTimeout(Resolve, ms));
  }

  private ParseBoolean(b: boolean): StringBooleanType {
    return (b ? 'True' : 'False');
  }

  private async AnimateTextbox(Mode: boolean): Promise<void> {
    const AnimationMode: [FancyUIElementFocusStateType, FancyUIElementFocusStateType, number] = this.AnimationModes[this.ParseBoolean(Mode)];
    const InverseAnimationMode: [FancyUIElementFocusStateType, FancyUIElementFocusStateType, number] = this.AnimationModes[this.ParseBoolean(!Mode)];

    clearTimeout(this.FocusTimeoutID);

    const CurrentFocusState: FancyUIElementFocusStateType = this.FocusState();

    if ((CurrentFocusState === AnimationMode[0]) || (CurrentFocusState === AnimationMode[1])) {
      const AnimationTimeElapsed: number = (performance.now() - (this.AnimationStartTime));

      if (AnimationTimeElapsed <= AnimationMode[2]) {
        await this.Wait(AnimationMode[2] - AnimationTimeElapsed);
      }

      this.FocusState.set(InverseAnimationMode[1]);
      this.AnimationStartTime = performance.now();

      this.FocusTimeoutID = setTimeout((): void => {
        this.FocusState.set(InverseAnimationMode[0]);
      }, (this.AnimationDurationIn));
    }
  }

  private AnimateIconChange(NewIcon: Undefinable<string>): void {
    if ((this.IconAnimationState()) === 'Idle') {
      this.QueuedIcon = NewIcon;
      this.IconAnimationState.set('Exiting');
    } else {
      this.QueuedIcon = NewIcon;
    }
  }

  public OnIconAnimationEnd(): void {
    const CurrentState: FancyTextboxIconStateType = this.IconAnimationState();

    if (CurrentState === 'Exiting') {
      this.DisplayedIcon.set(this.QueuedIcon);
      this.QueuedIcon = undefined;
      this.IconAnimationState.set('Entering');
    } else if (CurrentState === 'Entering') {
      this.IconAnimationState.set('Idle');
    }
  }

  // #endregion

  // #region Inputs

  public ID: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);
  public Name: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);
  public Autocomplete: InputSignal<Undefinable<string>> = input<Undefinable<string>>('off');

  public MaximumLength: InputSignal<Undefinable<number>> = input<Undefinable<number>>(undefined);
  public Tabindex: InputSignal<Undefinable<number>> = input<Undefinable<number>>(undefined);

  public Icon: InputSignal<Undefinable<string>> = input<Undefinable<string>>('');

  /** The global interface type signal. */
  private GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;

  /** Local type override. */
  public Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);

  /** The final type to use. */
  public EffectiveType: Signal<FancyUIElementTypeType> = computed((): FancyUIElementTypeType => (this.Type() ?? this.GlobalType()));

  public BorderAnimation: InputSignal<Undefinable<VerticalPositionType>> = input<Undefinable<VerticalPositionType>>('Above');

  public Order: InputSignal<Undefinable<FancyTextboxOrderType>> = input<Undefinable<FancyTextboxOrderType>>('Unique');

  public IsSensitive: InputSignal<boolean> = input<boolean>(false);
  public InitialVisibility: InputSignal<boolean> = input<boolean>(false);

  /** Whitelist of allowed characters. If set, only these characters can be typed or pasted. */
  public OnlyAllow: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);

  public Placeholder: InputSignal<string> = input<string>('');
  public readonly DisplayPlaceholder: WritableSignal<string> = signal<string>('');
  private PlaceholderAnimator: TypewriterAnimator = new TypewriterAnimator();

  // #endregion

  // #region Outputs

  @Output() Submit: EventEmitter<void> = new EventEmitter<void>();

  @Output() Select: EventEmitter<void> = new EventEmitter<void>();
  @Output() Unselect: EventEmitter<void> = new EventEmitter<void>();

  @Output() Focus: EventEmitter<void> = new EventEmitter<void>();
  @Output() Unfocus: EventEmitter<void> = new EventEmitter<void>();

  @Output() Hover: EventEmitter<void> = new EventEmitter<void>();
  @Output() Unhover: EventEmitter<void> = new EventEmitter<void>();

  @Output() Cancel: EventEmitter<void> = new EventEmitter<void>();

  @Output() Down: EventEmitter<void> = new EventEmitter<void>();
  @Output() Up: EventEmitter<void> = new EventEmitter<void>();

  @Output() KeyDown: EventEmitter<void> = new EventEmitter<void>();
  @Output() KeyUp: EventEmitter<void> = new EventEmitter<void>();

  @Output() Wheel: EventEmitter<void> = new EventEmitter<void>();

  // #endregion

  // #region Event Handlers

  public OnSubmit(): void { this.Submit.emit(); }

  public async OnSelect(): Promise<void> {
    this.Select.emit();

    this.AnimateTextbox(true);
  }
  public async OnUnselect(): Promise<void> {
    this.Unselect.emit();

    this.AnimateTextbox(false);
  }

  public OnFocus(): void {
    this.Focus.emit();

    this.AnimateTextbox(true);
  }
  public OnUnfocus(): void {
    this.Unfocus.emit();

    this.AnimateTextbox(false);
  }

  public OnHover(): void { this.Hover.emit(); }
  public OnUnhover(): void { this.Unhover.emit(); }

  public OnCancel(): void { this.Cancel.emit(); }

  public OnDown(): void { this.Down.emit(); }
  public OnUp(): void { this.Up.emit(); }

  public OnKeyDown(): void { this.KeyDown.emit(); }
  public OnKeyUp(): void { this.KeyUp.emit(); }

  /** Blocks disallowed key presses before they reach the input. */
  public OnFilterKeyDown(Event: KeyboardEvent): void {
    if (!this.OnlyAllow()) return;

    if (Event.key.length !== 1 || Event.ctrlKey || Event.metaKey || Event.altKey) return;

    if (!this.OnlyAllow()!.includes(Event.key)) {
      Event.preventDefault();
    }
  }

  /** Intercepts paste events and filters out disallowed characters from clipboard data. */
  public OnPaste(Event: ClipboardEvent): void {
    if (!this.OnlyAllow()) return;

    Event.preventDefault();

    const PastedText: string = Event.clipboardData?.getData('text') ?? '';
    const AllowedSet: Set<string> = new Set(this.OnlyAllow());
    const Filtered: string = [...PastedText].filter((Character: string) => AllowedSet.has(Character)).join('');

    if (Filtered) {
      const Input: HTMLInputElement = Event.target as HTMLInputElement;
      const Start: number = Input.selectionStart ?? this.InputValue.length;
      const End: number = Input.selectionEnd ?? Start;

      this.InputValue = this.InputValue.slice(0, Start) + Filtered + this.InputValue.slice(End);
    }
  }

  public OnWheel(): void { this.Wheel.emit(); }

  public ToggleVisibility(): void {
    this.IsVisible = !(this.IsVisible);
  }

  ngOnInit(): void {
    this.IsVisible = this.InitialVisibility();
    this.DisplayedIcon.set(this.Icon());
  }

  ngOnChanges(Changes: SimpleChanges): void {
    if (Changes['Icon'] && !Changes['Icon'].firstChange) {
      this.AnimateIconChange(Changes['Icon'].currentValue);
    }

    if (Changes['Placeholder'] && !Changes['Placeholder'].firstChange) {
      const OldText: string = (Changes['Placeholder'].previousValue ?? '').trim();
      const NewText: string = (Changes['Placeholder'].currentValue ?? '').trim();

      if (OldText === '' || NewText === OldText) {
        this.DisplayPlaceholder.set(NewText);
        this.PlaceholderAnimator.Cancel();
      } else {
        this.PlaceholderAnimator.Animate(
          OldText,
          NewText,
          (Text: string): void => { this.DisplayPlaceholder.set(Text); },
          this.InterfaceService.EffectiveTypewriter()
        );
      }
    } else if (Changes['Placeholder'] && Changes['Placeholder'].firstChange) {
      this.DisplayPlaceholder.set(this.Placeholder());
    }
  }

  // #endregion
}
