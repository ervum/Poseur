import { Directive, ElementRef, inject, input, effect, type InputSignal } from '@angular/core';

import { TypewriterAnimator } from '../../utilities/typewriter';
import { InterfaceService } from '../../../core/services/interface/interface';



@Directive({
  selector: '[FancyTypewriter]',
  standalone: true
})
export class TypewriterDirective {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly ElementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly Animator: TypewriterAnimator = new TypewriterAnimator();

  public Text: InputSignal<string> = input<string>('', { alias: 'FancyTypewriter' });

  private Initialized: boolean = false;

  constructor() {
    effect((): void => {
      const NewText: string = ((this.Text()?.trim()) ?? '');
      const OldText: string = ((this.ElementRef.nativeElement.textContent?.trim()) ?? '');

      if (!this.Initialized || (NewText === OldText)) {
        if (NewText !== '') {
          this.ElementRef.nativeElement.textContent = NewText;
          this.Initialized = true;
        }

        return;
      }

      this.Animator.Animate(
        OldText,
        NewText,
        (Text: string): void => { this.ElementRef.nativeElement.textContent = Text; },
        this.InterfaceService.EffectiveTypewriter()
      );
    });
  }
}
