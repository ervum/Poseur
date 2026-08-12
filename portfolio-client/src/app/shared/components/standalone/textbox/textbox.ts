import { Component, EventEmitter, OnInit, OnChanges, SimpleChanges, Output, inject, input, computed, type Signal, type WritableSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Undefinable, FancyUIElementTypeType, FancyTextboxOrderType, FancyTextboxIconStateType, VerticalPositionType, FancyUIElementFocusStateType, StringBooleanType, Nullable, NGStylesType } from '@ervum/types';

import { ContainerComponent } from '../container/container';

import { InterfaceService } from '../../../../core/services/interface/interface';
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

  private readonly IconsBasePath: string = '../../../../../assets/icons/';

  private readonly AnimationDurationIn: number = 2000;
  private readonly AnimationDurationOut: number = 2000;

  /**
   * Configuration for animation states based on the boolean mode.
   * - Used to determine if the component is currently in a state that opposes the desired action.
   * 
   * **Structure:** `[CurrentStateCheck, TransitioningState, Duration]`
   * 
   * 1. `True` (Opening): Checks against `Unfocused`/`Unfocusing`.
   * 2. `False` (Closing): Checks against `Focused`/`Focusing`.
   */
  private readonly AnimationModes: Record<StringBooleanType, [FancyUIElementFocusStateType, FancyUIElementFocusStateType, number]> = {
    'True': ['Unfocused', 'Unfocusing', (this.AnimationDurationOut)],
    'False': ['Focused', 'Focusing', (this.AnimationDurationIn)]
  };

  private FocusTimeoutID: Undefinable<ReturnType<typeof setTimeout>>;
  private AnimationStartTime: number = 0;

  public TextboxStyles: NGStylesType = {};

  public InputValue: string = '';
  public FocusState: FancyUIElementFocusStateType = 'Unfocused';

  public IsVisible: boolean = false;
  public DisplayedIcon: Undefinable<string>;
  public QueuedIcon: Undefinable<string>;
  public IconAnimationState: FancyTextboxIconStateType = 'Idle';

  // #endregion

  // #region Style & Class Getters

  /**
   * Base classes used by almost every element.
   * 
   * - Includes: `Type` and `Style`.
   * 1. **Type**: (`Primary` | `Secondary`)
   * 2. **Style**: (`Standard` | `Backgroundless`)
   */
  private get GetBaseClasses(): Record<string, boolean> {
    return {
      [`FancyTextbox--${this.EffectiveType()}`]: true
    };
  }

  /**
   * Order classes used by wrappers and overlays to determine border radius and positioning.
   * 
   * - Includes: `First`, `Intermediate`, `Last` and `Unique`.
   * 84. **Includes: `First`, `Intermediate`, `Last` and `Unique`.**
   */
  public get GetOrderClasses(): Record<string, boolean> {
    return {
      [`FancyTextbox--${this.Order()}`]: true
    };
  }

  /** Class Getter for `.FancyTextbox-Icon-Container`. */
  public get GetIconContainerClasses(): Record<string, boolean> {
    return {
      ...(this.GetBaseClasses),
      ...(this.GetOrderClasses)
    };
  }

  /** Class Getter for `.FancyTextbox-Content`. */
  public get GetContentClasses(): Record<string, boolean> {
    return {};
  }

  /** Class Getter for `.FancyTextbox-Placeholder` and `.FancyTextbox-Border`. */
  public get GetOverlayClasses(): Record<string, boolean> {
    return {
      ...(this.GetBaseClasses),
      ...(this.GetOrderClasses),

      'FancyTextboxBorder--AnimationBelow': ((this.BorderAnimation()) === 'Below')
    };
  }

  /** Class Getter for `.FancyTextbox` and `.FancyTextbox-Icon`. */
  public get GetInputClasses(): Record<string, boolean> {
    return {
      [`FancyTextbox--${this.EffectiveType()}`]: true,
      ...(this.GetOrderClasses)
    };
  }

  /**
   * Constructs the background image URL for the icon.
   * @returns `url(...)` string or empty string if no icon is set.
   * 
   * **NOTE: Hardcodes extension to `.png`.**
   */
  public get TextboxIconStyle(): string {
    if (!(this.DisplayedIcon)) {
      return '';
    }

    return `url(${this.IconsBasePath}${this.DisplayedIcon}.png)`;
  }

  public get GetIconStyles(): NGStylesType {
    if (!this.TextboxIconStyle) {
      return {};
    }

    return {
      '-webkit-mask-image': this.TextboxIconStyle,
      'mask-image': this.TextboxIconStyle
    };
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

  /**
   * Orchestrates the focus/blur animation logic.
   * 
   * 1. Determines the "Opposite" state (`AnimationMode`) vs the "Target" state (`InverseAnimationMode`).
   * 2. Checks if the component is currently in the "Opposite" state (i.e, trying to Focus while Unfocused).
   * 3. Calculates elapsed time to handle interruptions (i.e., focusing while in the middle of unfocusing).
   * 4. Waits for any pending previous animation to complete if necessary.
   * 5. Sets the transition state (`Focusing` / `Unfocusing`) and schedules the final state.
   * 
   * @param Mode - `true` to Focus/Select, `false` to Unfocus/Unselect.
   */
  private async AnimateTextbox(Mode: boolean): Promise<void> {
    const AnimationMode: [FancyUIElementFocusStateType, FancyUIElementFocusStateType, number] = this.AnimationModes[this.ParseBoolean(Mode)];
    const InverseAnimationMode: [FancyUIElementFocusStateType, FancyUIElementFocusStateType, number] = this.AnimationModes[this.ParseBoolean(!Mode)];

    clearTimeout(this.FocusTimeoutID);

    // If current state matches the "Start" or "Transition" phase of the opposing mode
    if (((this.FocusState) === AnimationMode[0]) || ((this.FocusState) === AnimationMode[1])) {
      let AnimationTimeElapsed: number = (performance.now() - (this.AnimationStartTime));

      // Wait for the previous animation to finish if interrupted
      if (AnimationTimeElapsed <= AnimationMode[2]) {
        await this.Wait(AnimationMode[2] - AnimationTimeElapsed);
      }

      // Begin new transition
      this.FocusState = InverseAnimationMode[1];
      this.AnimationStartTime = performance.now();

      // Schedule final state
      this.FocusTimeoutID = setTimeout(() => {
        this.FocusState = InverseAnimationMode[0];
      }, (this.AnimationDurationIn));
    }
  }

  private AnimateIconChange(NewIcon: Undefinable<string>): void {
    if (this.IconAnimationState === 'Idle') {
      this.QueuedIcon = NewIcon;
      this.IconAnimationState = 'Exiting';
    } else {
      this.QueuedIcon = NewIcon;
    }
  }

  public OnIconAnimationEnd(): void {
    if (this.IconAnimationState === 'Exiting') {
      this.DisplayedIcon = this.QueuedIcon;
      this.QueuedIcon = undefined;
      this.IconAnimationState = 'Entering';
    } else if (this.IconAnimationState === 'Entering') {
      this.IconAnimationState = 'Idle';
    }
  }

  // #endregion

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
  public EffectiveType: Signal<FancyUIElementTypeType> = computed(() => (this.Type() ?? this.GlobalType()));

  public BorderAnimation: InputSignal<Undefinable<VerticalPositionType>> = input<Undefinable<VerticalPositionType>>('Above');

  public Order: InputSignal<Undefinable<FancyTextboxOrderType>> = input<Undefinable<FancyTextboxOrderType>>('Unique');

  public IsSensitive: InputSignal<boolean> = input(false);
  public InitialVisibility: InputSignal<boolean> = input(false);

  /** Whitelist of allowed characters. If set, only these characters can be typed or pasted. */
  public OnlyAllow: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);

  public Placeholder: InputSignal<string> = input('');
  public DisplayPlaceholder: string = '';
  private PlaceholderAnimator: TypewriterAnimator = new TypewriterAnimator();
  private readonly PlaceholderTypewriter: TypewriterAnimator = new TypewriterAnimator();

  // #endregion

  // #region Outputs

  @Output() Submit: EventEmitter<void> = new EventEmitter<void>();

  @Output() Select: EventEmitter<void> = new EventEmitter<void>();
  @Output() Unselect: EventEmitter<void> = new EventEmitter<void>();

  @Output() Focus: EventEmitter<void> = new EventEmitter<void>();
  @Output() Unfocus: EventEmitter<void> = new EventEmitter<void>();

  @Output() Hover: EventEmitter<void> = new EventEmitter<void>();
  @Output() Move: EventEmitter<void> = new EventEmitter<void>();
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
  public OnMove(): void { this.Move.emit(); }
  public OnUnhover(): void { this.Unhover.emit(); }

  public OnCancel(): void { this.Cancel.emit(); }

  public OnDown(): void { this.Down.emit(); }
  public OnUp(): void { this.Up.emit(); }

  public OnKeyDown(): void { this.KeyDown.emit(); }
  public OnKeyUp(): void { this.KeyUp.emit(); }

  /** Blocks disallowed key presses before they reach the input. */
  public OnFilterKeyDown(Event: KeyboardEvent): void {
    if (!this.OnlyAllow()) return;

    // Allow control keys (backspace, delete, arrows, tab, etc.)
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
    this.DisplayedIcon = this.Icon();
  }

  ngOnChanges(Changes: SimpleChanges): void {
    if (Changes['Icon'] && !Changes['Icon'].firstChange) {
      this.AnimateIconChange(Changes['Icon'].currentValue);
    }

    if (Changes['Placeholder'] && !Changes['Placeholder'].firstChange) {
      const OldText: string = (Changes['Placeholder'].previousValue ?? '').trim();
      const NewText: string = (Changes['Placeholder'].currentValue ?? '').trim();

      if (OldText === '' || NewText === OldText) {
        this.DisplayPlaceholder = NewText;
        this.PlaceholderAnimator.Cancel();
      } else {
        this.PlaceholderAnimator.Animate(
          OldText,
          NewText,
          (Text: string) => { this.DisplayPlaceholder = Text; },
          this.InterfaceService.Typewriter()
        );
      }
    } else if (Changes['Placeholder'] && Changes['Placeholder'].firstChange) {
      this.DisplayPlaceholder = this.Placeholder();
    }
  }

  // #endregion
}