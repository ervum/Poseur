import { Component, ElementRef, EventEmitter, Output, PLATFORM_ID, computed, inject, input, model, signal, effect, untracked, type Signal, type WritableSignal, type ModelSignal, type InputSignal, type EffectCleanupRegisterFn } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { FancyDropdownItemType, FancyUIElementTypeType, Undefinable } from '@ervum/types';

import { ContainerComponent } from '../container/container';

import { InterfaceService } from '../../../../core/services/interface/interface';
import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';



@Component({
  selector: 'FancyDropdown',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    TypewriterDirective
  ],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  host: {
    '[class.FancyDropdown--Primary]': 'EffectiveType() === "Primary"',
    '[class.FancyDropdown--Secondary]': 'EffectiveType() === "Secondary"',
    '[class.FancyDropdown--Open]': 'IsOpen()'
  }
})
export class DropdownComponent {
  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly ElementRef: ElementRef<HTMLElement> = inject(ElementRef);

  public Items: InputSignal<FancyDropdownItemType[]> = input<FancyDropdownItemType[]>([]);
  public SelectedItem: ModelSignal<Undefinable<FancyDropdownItemType>> = model<Undefinable<FancyDropdownItemType>>();

  @Output() SelectionChange: EventEmitter<FancyDropdownItemType> = new EventEmitter<FancyDropdownItemType>();

  public readonly IsOpen: WritableSignal<boolean> = signal<boolean>(false);

  private GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;
  public Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);
  public EffectiveType: Signal<FancyUIElementTypeType> = computed((): FancyUIElementTypeType => (this.Type() ?? this.GlobalType()));

  /** Displayed text for the trigger label. */
  public TriggerLabel: Signal<string> = computed((): string => (this.SelectedItem()?.Label ?? 'Select'));

  /** Displayed text for each list item. Keyed by item reference. */
  public readonly ItemLabels: WritableSignal<Map<FancyDropdownItemType, string>> = signal<Map<FancyDropdownItemType, string>>(new Map<FancyDropdownItemType, string>());

  constructor() {
    effect((): void => {
      const Items: FancyDropdownItemType[] = this.Items();
      const NextLabels: Map<FancyDropdownItemType, string> = new Map<FancyDropdownItemType, string>();

      for (const Item of Items) {
        NextLabels.set(Item, Item.Label);
      }

      this.ItemLabels.set(NextLabels);

      const CurrentSelected: Undefinable<FancyDropdownItemType> = untracked((): Undefinable<FancyDropdownItemType> => this.SelectedItem());

      if (CurrentSelected) {
        const MatchingItem: Undefinable<FancyDropdownItemType> = Items.find((Item: FancyDropdownItemType): boolean => this.IsSameItem(Item, CurrentSelected));

        if (MatchingItem && (MatchingItem !== CurrentSelected)) {
          this.SelectedItem.set(MatchingItem);
        }
      }
    });

    if (isPlatformBrowser(this.PlatformID)) {
      effect((OnCleanup: EffectCleanupRegisterFn): void => {
        if (!(this.IsOpen())) return;

        const HandleDocumentClick: ((Event: MouseEvent) => (void)) = (Event: MouseEvent): void => {
          this.OnClickOutside(Event);
        };

        document.addEventListener('click', HandleDocumentClick);

        OnCleanup((): void => {
          document.removeEventListener('click', HandleDocumentClick);
        });
      });
    }
  }

  /** Checks whether two dropdown items are identical either by reference or by ID/Label. */
  public IsSameItem(A: Undefinable<FancyDropdownItemType>, B: Undefinable<FancyDropdownItemType>): boolean {
    if (!A || !B) return (A === B);
    if ((A.ID !== undefined) && (B.ID !== undefined)) return (A.ID === B.ID);

    return (A === B) || (A.Label === B.Label);
  }

  /** Toggles the dropdown open/closed state. */
  public Toggle(): void {
    this.IsOpen.set(!(this.IsOpen()));
  }

  /** Selects an item, closes the dropdown, and updates labels. */
  public Select(Item: FancyDropdownItemType): void {
    const PreviousItem: Undefinable<FancyDropdownItemType> = this.SelectedItem();

    this.SelectedItem.set(Item);
    this.IsOpen.set(false);

    this.SelectionChange.emit(Item);

    if (Item.Action) {
      Item.Action(...(Item.ActionArguments ?? []));
    }

    if (PreviousItem) {
      const ClearedMap: Map<FancyDropdownItemType, string> = new Map<FancyDropdownItemType, string>(this.ItemLabels());
      ClearedMap.set(PreviousItem, '');
      this.ItemLabels.set(ClearedMap);

      requestAnimationFrame((): void => {
        const RestoredMap: Map<FancyDropdownItemType, string> = new Map<FancyDropdownItemType, string>(this.ItemLabels());
        RestoredMap.set(PreviousItem, PreviousItem.Label);
        this.ItemLabels.set(RestoredMap);
      });
    }
  }

  /** Returns the label for a given item. */
  public GetItemLabel(Item: FancyDropdownItemType): string {
    return (this.ItemLabels().get(Item) ?? Item.Label);
  }

  /** Closes the dropdown when clicking outside of it. */
  public OnClickOutside(Event: MouseEvent): void {
    if (!this.ElementRef.nativeElement.contains(Event.target as Node)) {
      this.IsOpen.set(false);
    }
  }
}
