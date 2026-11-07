import {
  Component,
  EventEmitter,
  Output,
  input,
  signal,
  computed,
  ElementRef,
  ViewChild,
  HostListener,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
  PLATFORM_ID,
  type InputSignal,
  type WritableSignal,
  type Signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { type Nullable, type Undefinable } from '@ervum/types';



@Component({
  selector: 'FancySlider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.html',
  styleUrl: './slider.scss'
})
export class SliderComponent implements OnChanges, OnDestroy {
  private readonly PlatformID: object = inject(PLATFORM_ID);
  private readonly IsBrowserEnvironment: boolean = isPlatformBrowser(this.PlatformID);

  private static ActiveSliderInstanceIdentifier: Nullable<string> = null;

  @ViewChild('TrackContainerElement') private TrackContainerReference: Undefinable<ElementRef<HTMLElement>>;

  @Output() public ValueChange: EventEmitter<number> = new EventEmitter<number>();

  public readonly SliderInstanceIdentifier: string = `Slider_${Math.random().toString(36).substring(2, 9)}`;

  public Min: InputSignal<number> = input<number>(0);
  public Max: InputSignal<number> = input<number>(100);
  public HardMinimum: InputSignal<Undefinable<number>> = input<Undefinable<number>>(undefined);
  public HardMaximum: InputSignal<Undefinable<number>> = input<Undefinable<number>>(undefined);
  public Step: InputSignal<number> = input<number>(1);
  public Value: InputSignal<number> = input<number>(0);
  public ScaleMarkers: InputSignal<string[]> = input<string[]>([]);
  public ShowScaleMarkers: InputSignal<boolean> = input<boolean>(true);

  public DisplayValue: WritableSignal<number> = signal<number>(0);
  public IsActiveSlider: WritableSignal<boolean> = signal<boolean>(false);

  private VisualTweenAnimationIdentifier: Nullable<number> = null;
  private TargetDestinationValue: number = 0;
  private IsPointerDown: boolean = false;
  private IsDraggingActive: boolean = false;
  private PointerDownClientX: number = 0;

  public readonly TrackBackgroundStyle: Signal<Record<string, string>> = computed((): Record<string, string> => {
    const Minimum: number = this.Min();
    const Maximum: number = this.Max();
    const EffectiveMin: number = ((this.HardMinimum()) !== undefined) ? Math.max(Minimum, this.HardMinimum()!) : Minimum;
    const EffectiveMax: number = ((this.HardMaximum()) !== undefined) ? Math.min(Maximum, this.HardMaximum()!) : Maximum;

    const RawVisual: number = this.DisplayValue();
    const CurrentVisual: number = Math.min(EffectiveMax, Math.max(EffectiveMin, RawVisual));

    const Range: number = (Maximum - Minimum);
    const NormalizedRatio: number = (Range > 0) ? Math.min(1, Math.max(0, ((CurrentVisual - Minimum) / Range))) : 0;

    return {
      'background': `linear-gradient(to right, var(--accent-brand) 0%, var(--accent-brand) calc(11px + (100% - 22px) * ${NormalizedRatio}), var(--border-main) calc(11px + (100% - 22px) * ${NormalizedRatio}), var(--border-main) 100%)`,
    };
  });

  public readonly CustomThumbPositionStyle: Signal<Record<string, string>> = computed((): Record<string, string> => {
    const Minimum: number = this.Min();
    const Maximum: number = this.Max();
    const EffectiveMin: number = ((this.HardMinimum()) !== undefined) ? Math.max(Minimum, this.HardMinimum()!) : Minimum;
    const EffectiveMax: number = ((this.HardMaximum()) !== undefined) ? Math.min(Maximum, this.HardMaximum()!) : Maximum;

    const RawVisual: number = this.DisplayValue();
    const CurrentVisual: number = Math.min(EffectiveMax, Math.max(EffectiveMin, RawVisual));

    const Range: number = (Maximum - Minimum);
    const NormalizedRatio: number = (Range > 0) ? Math.min(1, Math.max(0, ((CurrentVisual - Minimum) / Range))) : 0;

    return {
      'left': `calc(11px + (100% - 22px) * ${NormalizedRatio})`,
    };
  });

  public ngOnChanges(Changes: SimpleChanges): void {
    if (Changes['Value']) {
      const TargetValue: number = ((Changes['Value'].currentValue) ?? 0);
      if ((Math.abs(TargetValue - (this.TargetDestinationValue)) > 0.0001) || ((this.VisualTweenAnimationIdentifier) === null)) {
        this.TweenVisualDisplayToTarget(TargetValue, 340);
      }
    }

    if (Changes['HardMinimum'] || Changes['HardMaximum']) {
      const EffectiveMin: number = ((this.HardMinimum()) !== undefined) ? Math.max(this.Min(), this.HardMinimum()!) : this.Min();
      const EffectiveMax: number = ((this.HardMaximum()) !== undefined) ? Math.min(this.Max(), this.HardMaximum()!) : this.Max();
      const CurrentDisplay: number = this.DisplayValue();

      if (CurrentDisplay < EffectiveMin) {
        this.TweenVisualDisplayToTarget(EffectiveMin, 200);
      } else if (CurrentDisplay > EffectiveMax) {
        this.TweenVisualDisplayToTarget(EffectiveMax, 200);
      }
    }
  }

  public ngOnDestroy(): void {
    if ((SliderComponent.ActiveSliderInstanceIdentifier) === (this.SliderInstanceIdentifier)) {
      SliderComponent.ActiveSliderInstanceIdentifier = null;
    }

    if (((this.VisualTweenAnimationIdentifier) !== null) && (typeof cancelAnimationFrame !== 'undefined')) {
      cancelAnimationFrame(this.VisualTweenAnimationIdentifier);
      this.VisualTweenAnimationIdentifier = null;
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  public OnDocumentPointerDown(Event: PointerEvent): void {
    const TargetElement: Node = Event.target as Node;
    if ((this.TrackContainerReference?.nativeElement) && !(this.TrackContainerReference.nativeElement.contains(TargetElement))) {
      if ((SliderComponent.ActiveSliderInstanceIdentifier) === (this.SliderInstanceIdentifier)) {
        SliderComponent.ActiveSliderInstanceIdentifier = null;
      }
      this.IsActiveSlider.set(false);
    }
  }

  @HostListener('window:keydown', ['$event'])
  public OnWindowKeyDown(Event: KeyboardEvent): void {
    if ((SliderComponent.ActiveSliderInstanceIdentifier) !== (this.SliderInstanceIdentifier)) return;

    this.HandleArrowKeyNavigation(Event);
  }

  public OnTrackPointerDown(Event: PointerEvent): void {
    const ContainerElement: HTMLElement = Event.currentTarget as HTMLElement;
    try {
      ContainerElement.setPointerCapture?.(Event.pointerId);
    } catch {
      // Ignore if not supported
    }

    this.IsPointerDown = true;
    this.IsDraggingActive = false;
    this.PointerDownClientX = Event.clientX;

    SliderComponent.ActiveSliderInstanceIdentifier = this.SliderInstanceIdentifier;
    this.IsActiveSlider.set(true);

    const StartValue: number = this.DisplayValue();
    const TargetValue: number = this.CalculateValueFromPointerEvent(Event, ContainerElement);

    this.TweenVisualDisplayFromStartToTarget(StartValue, TargetValue, 340);
    this.ValueChange.emit(TargetValue);
  }

  public OnTrackPointerMove(Event: PointerEvent): void {
    if (!(this.IsPointerDown)) return;

    const MoveDeltaX: number = Math.abs((Event.clientX) - (this.PointerDownClientX));
    if (!(this.IsDraggingActive) && (MoveDeltaX < 4)) return;

    this.IsDraggingActive = true;

    if (((this.VisualTweenAnimationIdentifier) !== null) && (typeof cancelAnimationFrame !== 'undefined')) {
      cancelAnimationFrame(this.VisualTweenAnimationIdentifier);
      this.VisualTweenAnimationIdentifier = null;
    }

    const ContainerElement: HTMLElement = Event.currentTarget as HTMLElement;
    const TargetValue: number = this.CalculateValueFromPointerEvent(Event, ContainerElement);

    if (Math.abs(TargetValue - (this.TargetDestinationValue)) > 0.0001) {
      this.TargetDestinationValue = TargetValue;
      this.DisplayValue.set(TargetValue);
      this.ValueChange.emit(TargetValue);
    }
  }

  public OnTrackPointerUp(Event: PointerEvent): void {
    if (!(this.IsPointerDown)) return;

    this.IsPointerDown = false;
    this.IsDraggingActive = false;

    const ContainerElement: HTMLElement = Event.currentTarget as HTMLElement;
    try {
      ContainerElement.releasePointerCapture?.(Event.pointerId);
    } catch {
      // Ignore if not captured
    }
  }

  public OnFocus(): void {
    SliderComponent.ActiveSliderInstanceIdentifier = this.SliderInstanceIdentifier;
    this.IsActiveSlider.set(true);
  }

  public OnBlur(): void {
    if ((SliderComponent.ActiveSliderInstanceIdentifier) === (this.SliderInstanceIdentifier)) {
      SliderComponent.ActiveSliderInstanceIdentifier = null;
    }
    this.IsActiveSlider.set(false);
  }

  private HandleArrowKeyNavigation(Event: KeyboardEvent): void {
    const EffectiveMin: number = ((this.HardMinimum()) !== undefined) ? Math.max(this.Min(), this.HardMinimum()!) : this.Min();
    const EffectiveMax: number = ((this.HardMaximum()) !== undefined) ? Math.min(this.Max(), this.HardMaximum()!) : this.Max();
    const StepSize: number = this.Step();

    if (((Event.key) === 'ArrowLeft') || ((Event.key) === 'ArrowDown')) {
      Event.preventDefault();
      const TargetValue: number = Math.max(EffectiveMin, (this.DisplayValue()) - StepSize);
      const DecimalPlaces: number = StepSize.toString().includes('.')
        ? StepSize.toString().split('.')[1].length
        : 0;
      const SnappedValue: number = Number(TargetValue.toFixed(DecimalPlaces));

      this.TweenVisualDisplayFromStartToTarget(this.DisplayValue(), SnappedValue, 200);
      this.ValueChange.emit(SnappedValue);
    } else if (((Event.key) === 'ArrowRight') || ((Event.key) === 'ArrowUp')) {
      Event.preventDefault();
      const TargetValue: number = Math.min(EffectiveMax, (this.DisplayValue()) + StepSize);
      const DecimalPlaces: number = StepSize.toString().includes('.')
        ? StepSize.toString().split('.')[1].length
        : 0;
      const SnappedValue: number = Number(TargetValue.toFixed(DecimalPlaces));

      this.TweenVisualDisplayFromStartToTarget(this.DisplayValue(), SnappedValue, 200);
      this.ValueChange.emit(SnappedValue);
    }
  }

  private CalculateValueFromPointerEvent(Event: PointerEvent, Element: HTMLElement): number {
    const Rect: DOMRect = Element.getBoundingClientRect();
    const TouchX: number = ((Event.clientX) - (Rect.left));
    const UsableWidth: number = Math.max(1, ((Rect.width) - 22));
    const NormalizedRatio: number = Math.max(0, Math.min(1, ((TouchX - 11) / UsableWidth)));

    const Minimum: number = this.Min();
    const Maximum: number = this.Max();
    const RawTarget: number = (Minimum + (NormalizedRatio * (Maximum - Minimum)));

    const StepSize: number = this.Step();
    const DecimalPlaces: number = StepSize.toString().includes('.')
      ? StepSize.toString().split('.')[1].length
      : 0;

    const SnappedTarget: number = (StepSize > 0)
      ? Number((Math.round(RawTarget / StepSize) * StepSize).toFixed(DecimalPlaces))
      : RawTarget;

    const EffectiveMin: number = ((this.HardMinimum()) !== undefined) ? Math.max(Minimum, this.HardMinimum()!) : Minimum;
    const EffectiveMax: number = ((this.HardMaximum()) !== undefined) ? Math.min(Maximum, this.HardMaximum()!) : Maximum;

    return Math.min(EffectiveMax, Math.max(EffectiveMin, SnappedTarget));
  }

  private TweenVisualDisplayFromStartToTarget(StartValue: number, TargetValue: number, DurationMilliseconds: number = 340): void {
    const EffectiveMin: number = ((this.HardMinimum()) !== undefined) ? Math.max(this.Min(), this.HardMinimum()!) : this.Min();
    const EffectiveMax: number = ((this.HardMaximum()) !== undefined) ? Math.min(this.Max(), this.HardMaximum()!) : this.Max();
    const ClampedStart: number = Math.min(EffectiveMax, Math.max(EffectiveMin, StartValue));
    const ClampedTarget: number = Math.min(EffectiveMax, Math.max(EffectiveMin, TargetValue));

    this.TargetDestinationValue = ClampedTarget;

    if (!(this.IsBrowserEnvironment) || (typeof requestAnimationFrame === 'undefined')) {
      this.DisplayValue.set(ClampedTarget);

      return;
    }

    if (((this.VisualTweenAnimationIdentifier) !== null) && (typeof cancelAnimationFrame !== 'undefined')) {
      cancelAnimationFrame(this.VisualTweenAnimationIdentifier);
      this.VisualTweenAnimationIdentifier = null;
    }

    if (Math.abs(ClampedStart - ClampedTarget) < 0.0001) {
      this.DisplayValue.set(ClampedTarget);

      return;
    }

    const StartTimestamp: number = performance.now();

    const Step: ((CurrentTimestamp: number) => (void)) = (CurrentTimestamp: number): void => {
      const ElapsedMilliseconds: number = (CurrentTimestamp - StartTimestamp);
      const ProgressFraction: number = Math.min(1, (ElapsedMilliseconds / DurationMilliseconds));

      const EasingProgress: number = (ProgressFraction >= 1)
        ? 1
        : (1 - Math.pow(2, (-10 * ProgressFraction)));

      const RawInterpolated: number = (ClampedStart + ((ClampedTarget - ClampedStart) * EasingProgress));
      const InterpolatedValue: number = Math.min(EffectiveMax, Math.max(EffectiveMin, RawInterpolated));
      this.DisplayValue.set(InterpolatedValue);

      if (ProgressFraction < 1) {
        this.VisualTweenAnimationIdentifier = requestAnimationFrame(Step);
      } else {
        this.DisplayValue.set(ClampedTarget);
        this.VisualTweenAnimationIdentifier = null;
      }
    };

    this.VisualTweenAnimationIdentifier = requestAnimationFrame(Step);
  }

  private TweenVisualDisplayToTarget(TargetValue: number, DurationMilliseconds: number = 340): void {
    this.TweenVisualDisplayFromStartToTarget(this.DisplayValue(), TargetValue, DurationMilliseconds);
  }
}
