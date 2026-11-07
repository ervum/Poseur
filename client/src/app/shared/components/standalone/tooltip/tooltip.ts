import { Component, input, signal, effect, untracked, type InputSignal, type WritableSignal, type EffectCleanupRegisterFn } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContainerComponent } from '../container/container';
import { TypewriterDirective } from '../../../directives/typewriter/typewriter.directive';



/**
 * A generic, premium floating tooltip component.
 * Adapts to the global interface theme and displays an animated text message.
 * Supports configurable manga-style speechbubble arrow pointers on all sides.
 */
@Component({
  selector: 'FancyTooltip',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    TypewriterDirective
  ],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.scss',
  host: {
    '[class.FancyTooltip-Arrow--HasLeft]': 'ArrowLeft()',
    '[class.FancyTooltip-Arrow--HasRight]': 'ArrowRight()',
    '[class.FancyTooltip-Arrow--HasTop]': 'ArrowTop()',
    '[class.FancyTooltip-Arrow--HasBottom]': 'ArrowBottom()'
  }
})
export class TooltipComponent {
  /** The message text to display inside the tooltip. */
  public Message: InputSignal<string> = input<string>('');

  /** Whether the tooltip is currently visible. */
  public Active: InputSignal<boolean> = input<boolean>(false);

  /** Whether the tooltip uses the fixed top page-level layout. */
  public Fixed: InputSignal<boolean> = input<boolean>(true);

  /** Speechbubble arrow pointers for each side. */
  public ArrowTop: InputSignal<boolean> = input<boolean>(false);
  public ArrowBottom: InputSignal<boolean> = input<boolean>(false);
  public ArrowLeft: InputSignal<boolean> = input<boolean>(false);
  public ArrowRight: InputSignal<boolean> = input<boolean>(false);

  /** The message currently displayed, managed locally to delay clearing text until the fade transition finishes. */
  public DisplayedMessage: WritableSignal<string> = signal<string>('');

  constructor() {
    effect((OnCleanup: EffectCleanupRegisterFn): void => {
      const IsActive: boolean = this.Active();
      const MessageText: string = this.Message();

      if (IsActive && MessageText) {
        this.DisplayedMessage.set(MessageText);
      } else if (!IsActive && (typeof window !== 'undefined') && ((untracked((): string => this.DisplayedMessage())) !== '')) {
        const ClearTimeoutID: ReturnType<typeof setTimeout> = setTimeout((): void => {
          if (!(this.Active())) {
            this.DisplayedMessage.set('');
          }
        }, 600);

        OnCleanup((): void => {
          clearTimeout(ClearTimeoutID);
        });
      }
    });
  }
}
