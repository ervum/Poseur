import { Component, OnInit, inject, computed, type Signal, TransferState, makeStateKey, PLATFORM_ID, type StateKey } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { BackgroundPalette, FancyUIElementTypeType, Nullable } from '@ervum/types';

import { InterfaceService } from '../../../../core/services/interface/interface';



@Component({
  selector: 'DeepBackground',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deep-background.html',
  styleUrl: './deep-background.scss'
})
export class DeepBackgroundComponent {
  private InterfaceService: InterfaceService = inject(InterfaceService);
  private TransferState: TransferState = inject(TransferState);
  private PlatformID: object = inject(PLATFORM_ID);

  private static readonly PaletteKey: StateKey<{ Dark: BackgroundPalette; Light: BackgroundPalette }> = makeStateKey<{ Dark: BackgroundPalette; Light: BackgroundPalette }>('DeepBackground-Palette');

  /**
   * Generates a random palette on construction.
   * Both dark and light variants share the same random hue so
   * switching themes feels like a tonal shift rather than a new palette.
   */
  private readonly GeneratedPalette: { Dark: BackgroundPalette; Light: BackgroundPalette };

  constructor() {
    const SavedPalette: Nullable<{ Dark: BackgroundPalette; Light: BackgroundPalette }> = this.TransferState.get(DeepBackgroundComponent.PaletteKey, null);
    if (SavedPalette) {
      this.GeneratedPalette = SavedPalette;
    } else {
      this.GeneratedPalette = this.GenerateRandomPalettes();
      if (!isPlatformBrowser(this.PlatformID)) {
        this.TransferState.set(DeepBackgroundComponent.PaletteKey, this.GeneratedPalette);
      }
    }
  }

  /** Active palette based on current theme */
  public ActivePalette: Signal<BackgroundPalette> = computed(() => {
    const Theme: FancyUIElementTypeType = this.InterfaceService.InterfaceType();
    return Theme === 'Primary'
      ? this.GeneratedPalette.Dark
      : this.GeneratedPalette.Light;
  });

  /** CSS Variables to be applied to the host */
  public BackgroundStyles: Signal<Record<string, string>> = computed(() => {
    const Palette: BackgroundPalette = this.ActivePalette();
    return {
      '--background-colour-1': Palette.Colors[0],
      '--background-colour-2': Palette.Colors[1],
      '--background-colour-3': Palette.Colors[2],
      '--background-colour-4': Palette.Colors[3]
    };
  });

  // #region Palette Generation

  /** Returns a random number between `Min` and `Max`. */
  private RandomBetween(Min: number, Max: number): number {
    return Math.random() * (Max - Min) + Min;
  }

  /**
   * Converts HSL to a hex color string.
   * H: 0–360, S: 0–100, L: 0–100.
   */
  private HSLToHex(H: number, S: number, L: number): string {
    S /= 100;
    L /= 100;

    const k: (n: number) => number = (n: number) => (n + H / 30) % 12;
    const a: number = S * Math.min(L, 1 - L);
    const f: (n: number) => number = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const R: number = Math.round(255 * f(0));
    const G: number = Math.round(255 * f(8));
    const B: number = Math.round(255 * f(4));

    return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
  }

  /**
   * Generates a paired Dark + Light palette around a single random hue.
   *
   * **Dark (Primary):** Near-black colors with very low saturation (3–8%)
   * and very low lightness (1–4%). The result is almost pure black with
   * the faintest whisper of color — never noticeably red, green, etc.
   *
   * **Light (Secondary):** Near-white colors with very low saturation (3–8%)
   * and high lightness (98–99.5%). The result is a clean white base with
   * the faintest whisper of color — never noticeably red, green, etc.
   */
  private GenerateRandomPalettes(): { Dark: BackgroundPalette; Light: BackgroundPalette } {
    const BaseHue: number = this.RandomBetween(0, 360);

    const HueNames: string[] = ['Ocean', 'Forest', 'Crimson', 'Violet', 'Amber', 'Teal', 'Rose', 'Slate'];
    const Name: string = HueNames[Math.floor(Math.random() * HueNames.length)];

    // Generate 4 dark colors: near-black with barely perceptible tint
    const DarkColors: string[] = [];
    for (let i: number = 0; i < 4; i++) {
      const Hue: number = BaseHue + this.RandomBetween(-30, 30);
      const Saturation: number = this.RandomBetween(3, 8);
      const Lightness: number = this.RandomBetween(1, 4);
      DarkColors.push(this.HSLToHex(Hue, Saturation, Lightness));
    }

    // Generate 4 light colors: near-white with barely perceptible tint
    const LightColors: string[] = [];
    for (let i: number = 0; i < 4; i++) {
      const Hue: number = BaseHue + this.RandomBetween(-30, 30);
      const Saturation: number = this.RandomBetween(3, 8);
      const Lightness: number = this.RandomBetween(98, 99.5);
      LightColors.push(this.HSLToHex(Hue, Saturation, Lightness));
    }

    return {
      Dark:  { Name: `Deep-${Name}`,  Colors: DarkColors },
      Light: { Name: `Soft-${Name}`,  Colors: LightColors }
    };
  }

  // #endregion
}
