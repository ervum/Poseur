import {
  Component,
  input,
  model,
  signal,
  computed,
  output,
  inject,
  HostListener,
  type Signal,
  type WritableSignal,
  type ModelSignal,
  type InputSignal,
  type OutputEmitterRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  type Undefinable,
  type FancyUIElementTypeType,
  type FancySidebarSideType,
  type FancySidebarModeType
} from '@ervum/types';

import { MinibuttonComponent } from '../minibutton/minibutton';

import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';

import { InterfaceService } from '../../../../core/services/interface/interface';



@Component({
  selector: 'FancySidebar',
  standalone: true,
  imports: [
    CommonModule,

    MinibuttonComponent,

    TypewriterDirective
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: {
    '[class.FancySidebar--Primary]':   'EffectiveType() === "Primary"',
    '[class.FancySidebar--Secondary]': 'EffectiveType() === "Secondary"',
    '[class.FancySidebar--Viewport]':  'Mode() === "Viewport"',
    '[class.FancySidebar--Container]': 'Mode() === "Container"',
    '[class.FancySidebar--Open]':      'IsOpen()',
    '[class.FancySidebar--Closing]':   'IsClosing()',
    '[class.Side--Right]':             'Side() === "Right"',
    '[class.Side--Left]':              'Side() === "Left"',
    '[class.Side--Top]':               'Side() === "Top"',
    '[class.Side--Bottom]':            'Side() === "Bottom"',
  }
})
export class SidebarComponent {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public readonly IsOpen: ModelSignal<boolean> = model<boolean>(false);
  public readonly IsClosing: WritableSignal<boolean> = signal<boolean>(false);

  public readonly Side: InputSignal<FancySidebarSideType> = input<FancySidebarSideType>('Right');
  public readonly Mode: InputSignal<FancySidebarModeType> = input<FancySidebarModeType>('Viewport');
  public readonly Title: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);
  public readonly ShowCloseButton: InputSignal<boolean> = input<boolean>(true);
  public readonly ShowBackdrop: InputSignal<boolean> = input<boolean>(true);
  public readonly CloseOnBackdropClick: InputSignal<boolean> = input<boolean>(true);
  public readonly CloseOnEscape: InputSignal<boolean> = input<boolean>(true);
  public readonly Width: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);
  public readonly Height: InputSignal<Undefinable<string>> = input<Undefinable<string>>(undefined);

  public readonly Type: InputSignal<Undefinable<FancyUIElementTypeType>> = input<Undefinable<FancyUIElementTypeType>>(undefined);
  private readonly GlobalType: WritableSignal<FancyUIElementTypeType> = this.InterfaceService.InterfaceType;
  public readonly EffectiveType: Signal<FancyUIElementTypeType> = computed((): FancyUIElementTypeType => (this.Type() ?? this.GlobalType()));

  public readonly Closed: OutputEmitterRef<void> = output<void>();
  public readonly Opened: OutputEmitterRef<void> = output<void>();

  private ClosingTimer: Undefinable<ReturnType<typeof setTimeout>> = undefined;

  public Close(): void {
    if (!this.IsOpen() || this.IsClosing()) return;

    this.IsClosing.set(true);
    if ((this.ClosingTimer) !== undefined) {
      clearTimeout(this.ClosingTimer);
    }

    this.ClosingTimer = setTimeout((): void => {
      this.IsOpen.set(false);
      this.IsClosing.set(false);
      this.ClosingTimer = undefined;
      this.Closed.emit();
    }, 320);
  }

  public Open(): void {
    if (this.IsOpen()) return;

    if ((this.ClosingTimer) !== undefined) {
      clearTimeout(this.ClosingTimer);
      this.ClosingTimer = undefined;
    }

    this.IsOpen.set(true);
    this.IsClosing.set(false);
    this.Opened.emit();
  }

  public Toggle(): void {
    if (this.IsOpen()) {
      this.Close();
    } else {
      this.Open();
    }
  }

  public HandleBackdropClick(): void {
    if (this.CloseOnBackdropClick()) {
      this.Close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  public HandleDocumentKeydown(KeyboardEventInstance: KeyboardEvent): void {
    if (this.CloseOnEscape() && ((KeyboardEventInstance.key) === 'Escape') && this.IsOpen()) {
      this.Close();
    }
  }
}
