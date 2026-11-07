import { Nullable } from '@ervum/types';



/**
 * Reusable typewriter animation utility.
 *
 * Deletes the current text character by character, then types the new text
 * character by character using a single vsync-aligned `requestAnimationFrame` clock.
 */
export class TypewriterAnimator {
  /** The total duration of the animation in milliseconds. */
  private readonly TotalDuration: number;

  /** Monotonically increasing ID used to cancel stale animations. */
  private CurrentAnimationID: number = 0;

  /** Active requestAnimationFrame handle for immediate cancellation. */
  private AnimationFrameID: Nullable<number> = null;

  constructor(TotalDuration: number = 1000) {
    this.TotalDuration = TotalDuration;
  }

  /**
   * Animates a text transition from `OldText` to `NewText` within `TotalDuration`
   * using coalesced frame steps (at most one DOM write per display frame).
   */
  public Animate(
    OldText: string,
    NewText: string,
    SetText: ((Text: string) => (void)),
    AnimateEnabled: boolean = true
  ): Promise<void> {
    this.StopFrameLoop();

    if ((OldText === NewText) || !AnimateEnabled || (typeof window === 'undefined') || (typeof requestAnimationFrame === 'undefined')) {
      SetText(NewText);

      return Promise.resolve();
    }

    const AnimationID: number = ++(this.CurrentAnimationID);
    const OldLength: number = OldText.length;
    const NewLength: number = NewText.length;
    const DeleteSteps: number = (OldLength > 0) ? (OldLength + 1) : 0;
    const TotalSteps: number = (DeleteSteps + NewLength);

    if (TotalSteps <= 0) {
      SetText(NewText);

      return Promise.resolve();
    }

    return new Promise<void>((Resolve: (() => (void))): void => {
      const StartTime: number = performance.now();
      let LastRenderedStep: number = -1;

      const Tick: ((Now: number) => (void)) = (Now: number): void => {
        if ((this.CurrentAnimationID) !== AnimationID) {
          this.AnimationFrameID = null;
          Resolve();

          return;
        }

        const Elapsed: number = Math.max(0, (Now - StartTime));
        const Progress: number = ((this.TotalDuration) > 0)
          ? Math.min(1, (Elapsed / (this.TotalDuration)))
          : 1;
        const CurrentStep: number = Math.min((TotalSteps - 1), Math.floor(Progress * TotalSteps));

        if (Progress >= 1) {
          this.AnimationFrameID = null;
          SetText(NewText);
          Resolve();

          return;
        }

        if (CurrentStep !== LastRenderedStep) {
          LastRenderedStep = CurrentStep;

          if (CurrentStep < DeleteSteps) {
            const RemainingCount: number = (OldLength - CurrentStep);
            SetText(OldText.substring(0, Math.max(0, RemainingCount)));
          } else {
            const TypedCount: number = ((CurrentStep - DeleteSteps) + 1);
            SetText(NewText.substring(0, Math.min(NewLength, TypedCount)));
          }
        }

        this.AnimationFrameID = requestAnimationFrame(Tick);
      };

      this.AnimationFrameID = requestAnimationFrame(Tick);
    });
  }

  /** Cancels any in-flight animation. */
  public Cancel(): void {
    this.CurrentAnimationID++;
    this.StopFrameLoop();
  }

  private StopFrameLoop(): void {
    if (((this.AnimationFrameID) !== null) && (typeof cancelAnimationFrame !== 'undefined')) {
      cancelAnimationFrame(this.AnimationFrameID);
      this.AnimationFrameID = null;
    }
  }
}
