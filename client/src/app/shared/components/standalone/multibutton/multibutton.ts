import { Component, Output, EventEmitter, signal, WritableSignal, inject, input, computed, model, type Signal, type ModelSignal, type InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Nullable, FancyUIElementTypeType, FancyMultiButtonDisplayModeType, HorizontalPositionType, VerticalPositionType, FancyMultiButtonIndicatorStyleType, FancyMultibuttonItemType, Undefinable } from '@ervum/types';

import { ContainerComponent } from '../container/container';

import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';
import { GetIconVariantStyles } from '../../../utilities/icons';
import { InterfaceService } from '../../../../core/services/interface/interface';



@Component({
  selector: 'FancyMultibutton',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    TypewriterDirective
  ],
  templateUrl: './multibutton.html',
  styleUrl: './multibutton.scss',
  host: {
    '[class.FancyMultibutton--Vertical]': 'Vertical()',
    '[class.FancyMultibutton--Primary]': 'EffectiveType() === "Primary"',
    '[class.FancyMultibutton--Secondary]': 'EffectiveType() === "Secondary"'
  }
})
export class MultibuttonComponent {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  /** Currently selected button index. */
  public SelectedIndex: ModelSignal<number> = model<number>(0);
  public HoveredIndex: WritableSignal<Nullable<number>> = signal<Nullable<number>>(null);
  public LastHoveredIndex: WritableSignal<number> = signal<number>(0);

  /** Selects a button by index and invokes its action if defined. */
  public SelectButton(Index: number): void {
    if (Index === (this.SelectedIndex())) return;

    this.SelectedIndex.set(Index);
    this.SelectedIndexChange.emit(Index);

    const Item: Undefinable<FancyMultibuttonItemType> = this.Items()[Index];

    if (Item && (Item.Action)) {
      Item.Action(...((Item.ActionArguments) ?? []));
    }
  }

  /** Sets the hovered button index. */
  public OnHover(Index: number): void {
    this.HoveredIndex.set(Index);
    this.LastHoveredIndex.set(Index);
  }

  /** Clears the hovered button index. */
  public OnUnhover(): void {
    this.HoveredIndex.set(null);
  }

  public get GetBaseClasses(): Record<string, boolean> {
    const DefaultSide: string = this.Vertical() ? 'Left' : 'Below';
    const ActiveSide: string = this.IndicatorSide() || DefaultSide;

    return {
      [`FancyMultibutton--Vertical`]:   this.Vertical(),
      [`IndicatorPosition--${ActiveSide}`]: true,
    };
  }

  public get GetWrapperClasses(): Record<string, boolean> {
    return {
      'Hovering--First': (this.HoveredIndex()) === 0,
      'Hovering--Last':  ((this.HoveredIndex()) !== null) && ((this.HoveredIndex()) === ((this.Items().length) - 1)),
      ...(this.GetBaseClasses),
    };
  }

  public get GetContentStyles(): Record<string, Nullable<number>> {
    return {
      '--selected-index': this.SelectedIndex(),
      '--hover-index':    this.LastHoveredIndex(),
      '--button-count':   this.Items().length,
    };
  }

  public get GetHighlightClasses(): Record<string, boolean> {
    const HoveredIndex: Nullable<number> = this.HoveredIndex();
    const SelectedIndex: number = this.SelectedIndex();
    const IsHovering: boolean = (HoveredIndex !== null);

    return {
      'Hovering--Any':      IsHovering,
      'Hovering--Selected': (HoveredIndex !== null) && (HoveredIndex === SelectedIndex),
      'Hovering--Before':   (HoveredIndex !== null) && (HoveredIndex < SelectedIndex),
      'Hovering--After':    (HoveredIndex !== null) && (HoveredIndex > SelectedIndex),
    };
  }

  /** Classes for the special hover indicator (used when ShowHighlight is true). */
  public GetHoverIndicatorClasses(): Record<string, boolean> {
    return {
      'FancyMultibutton-Indicator--Hover': true,
      'Is-Active':                         ((this.HoveredIndex()) !== null),
    };
  }

  public GetButtonClasses(Index: number): Record<string, boolean> {
    const IsHoveringSelf: boolean = ((this.HoveredIndex()) === Index);
    const IsSelected: boolean = ((this.SelectedIndex()) === Index);

    return {
      'FancyMultibutton--Selected': IsSelected,
      'Hovering--Self':             IsHoveringSelf && !(this.ShowHighlight()),
      'Hovering--First':            Index === 0,
      'Hovering--Last':             Index === ((this.Items().length) - 1),
    };
  }

  public GetIconStyles(Label: string): Record<string, string> {
    return GetIconVariantStyles(Label);
  }

  // #region Inputs

  public Items: InputSignal<FancyMultibuttonItemType[]> = input<FancyMultibuttonItemType[]>([]);

  /** The global interface type signal. */
  private GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;

  /** Local type override. */
  public Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);

  /** The final type to use. */
  public EffectiveType: Signal<FancyUIElementTypeType> = computed((): FancyUIElementTypeType => (this.Type() ?? this.GlobalType()));

  public DisplayMode: InputSignal<Nullable<FancyMultiButtonDisplayModeType>> = input<Nullable<FancyMultiButtonDisplayModeType>>('Text');

  public Vertical: InputSignal<boolean> = input<boolean>(false);
  public IndicatorSide: InputSignal<Nullable<HorizontalPositionType | VerticalPositionType>> = input<Nullable<HorizontalPositionType | VerticalPositionType>>(null);
  public IndicatorType: InputSignal<FancyMultiButtonIndicatorStyleType> = input<FancyMultiButtonIndicatorStyleType>('Dash');

  public ShowHighlight: InputSignal<boolean> = input<boolean>(false);
  public ShowIndicator: InputSignal<boolean> = input<boolean>(false);

  // #endregion

  // #region Outputs

  @Output() SelectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

  // #endregion
}
