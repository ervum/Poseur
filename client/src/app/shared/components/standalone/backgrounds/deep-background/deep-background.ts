import { Component, inject, computed, type Signal, TransferState, makeStateKey, PLATFORM_ID, type StateKey } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { BackgroundPalette, FancyUIElementTypeType, Nullable } from '@ervum/types';

import { InterfaceService } from '../../../../../core/services/interface/interface';



@Component({
  selector: 'DeepBackground',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deep-background.html',
  styleUrl: './deep-background.scss'
})
export class DeepBackgroundComponent {
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  private readonly TransferState: TransferState = inject(TransferState);
  private readonly PlatformID: object = inject(PLATFORM_ID);

  private static readonly PaletteKey: StateKey<{ Dark: BackgroundPalette; Light: BackgroundPalette }> =
    makeStateKey<{ Dark: BackgroundPalette; Light: BackgroundPalette }>('DeepBackground-Palette');

  /**
   * Generates a random palette on construction.
   * Both dark and light variants share the same Lumina/Obsidian violet-indigo hue so
   * switching themes feels like a tonal shift rather than a new palette.
   */
  private readonly GeneratedPalette: { Dark: BackgroundPalette; Light: BackgroundPalette };

  constructor() {
    const SavedPalette: Nullable<{ Dark: BackgroundPalette; Light: BackgroundPalette }> =
      this.TransferState.get(DeepBackgroundComponent.PaletteKey, null);

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
  public readonly ActivePalette: Signal<BackgroundPalette> = computed((): BackgroundPalette => {
    const Theme: FancyUIElementTypeType = this.InterfaceService.InterfaceType();

    return (Theme === 'Primary')
      ? (this.GeneratedPalette.Dark)
      : (this.GeneratedPalette.Light);
  });

  /** CSS Variables to be applied to the host */
  public readonly BackgroundStyles: Signal<Record<string, string>> = computed((): Record<string, string> => {
    const Palette: BackgroundPalette = this.ActivePalette();
    const Swatches: string[] = (Palette.Colours ?? Palette.Colors);

    return {
      '--background-colour-1': Swatches[0],
      '--background-colour-2': Swatches[1],
      '--background-colour-3': Swatches[2],
      '--background-colour-4': Swatches[3],
    };
  });

  private RandomBetween(Minimum: number, Maximum: number): number {
    return ((Math.random() * (Maximum - Minimum)) + Minimum);
  }

  private HSLToHex(H: number, S: number, L: number): string {
    S /= 100;
    L /= 100;

    const k: ((n: number) => (number)) = (n: number): number => ((n + (H / 30)) % 12);
    const a: number = (S * Math.min(L, (1 - L)));
    const f: ((n: number) => (number)) = (n: number): number => (L - (a * Math.max(-1, Math.min((k(n) - 3), Math.min((9 - k(n)), 1)))));

    const R: number = Math.round(255 * f(0));
    const G: number = Math.round(255 * f(8));
    const B: number = Math.round(255 * f(4));

    return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
  }

  private GenerateRandomPalettes(): { Dark: BackgroundPalette; Light: BackgroundPalette } {
    // Anchor around Lumina/Obsidian violet-indigo hues (238°–278°)
    const BaseHue: number = this.RandomBetween(238, 278);

    const DarkColours: string[] = [];
    for (let i: number = 0; i < 4; i++) {
      const Hue: number = ((BaseHue + this.RandomBetween(-14, 14) + 360) % 360);
      const Saturation: number = this.RandomBetween(8, 18);
      const Lightness: number = this.RandomBetween(1.8, 3.8);
      DarkColours.push(this.HSLToHex(Hue, Saturation, Lightness));
    }

    const LightColours: string[] = [];
    for (let i: number = 0; i < 4; i++) {
      const Hue: number = ((BaseHue + this.RandomBetween(-14, 14) + 360) % 360);
      const Saturation: number = this.RandomBetween(14, 28);
      const Lightness: number = this.RandomBetween(97.0, 98.8);
      LightColours.push(this.HSLToHex(Hue, Saturation, Lightness));
    }

    return {
      Dark:  { Name: 'Deep-LuminaViolet', Colors: DarkColours, Colours: DarkColours },
      Light: { Name: 'Soft-ObsidianMist', Colors: LightColours, Colours: LightColours },
    };
  }
}
