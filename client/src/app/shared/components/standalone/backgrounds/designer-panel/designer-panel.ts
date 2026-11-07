import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
  type InputSignal,
  type Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Undefinable,
  BackgroundScopeType,
  BackgroundLayerIDType,
  BackgroundLayerDescriptor,
  BackgroundLayerSettings,
  BackgroundLayersMap,
  BackgroundMotionModeType,
  BackgroundConfigurationModeType,
  VisitorBackgroundPreferenceModeType,
  BackgroundTextDescriptor,
  FancyMultibuttonItemType
} from '@ervum/types';
import {
  BackgroundLayerIDOrder,
  BackgroundLayerDescriptors,
  BackgroundMotionModes,
  BackgroundTextDictionary
} from '@ervum/constants';

import { ContainerComponent } from '../../container/container';
import { ToggleComponent } from '../../toggle/toggle';
import { MultibuttonComponent } from '../../multibutton/multibutton';
import { SliderComponent } from '../../slider/slider';
import { MinibuttonComponent } from '../../minibutton/minibutton';
import { FancyIconComponent } from '../../icon/icon';

import { BackgroundService } from '../../../../../core/services/background/background';
import { PerformanceService } from '../../../../../core/services/performance/performance';
import { InterfaceService } from '../../../../../core/services/interface/interface';
import { type TranslationDictionary } from '../../../../../core/internationalization';



@Component({
  selector: 'BackgroundDesignerPanel',
  standalone: true,
  imports: [
    CommonModule,
    ContainerComponent,
    ToggleComponent,
    MultibuttonComponent,
    SliderComponent,
    MinibuttonComponent,
    FancyIconComponent
  ],
  templateUrl: './designer-panel.html',
  styleUrl: './designer-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundDesignerPanelComponent {
  public readonly BackgroundService: BackgroundService = inject(BackgroundService);
  public readonly PerformanceService: PerformanceService = inject(PerformanceService);
  public readonly InterfaceService: InterfaceService = inject(InterfaceService);

  public readonly Scope: InputSignal<BackgroundScopeType> = input<BackgroundScopeType>('Public');
  public readonly AllowSiteDefaultMode: InputSignal<boolean> = input<boolean>(false);
  public readonly PersistImmediately: InputSignal<boolean> = input<boolean>(false);

  public readonly Text: BackgroundTextDescriptor = BackgroundTextDictionary;

  public readonly LayerDescriptorsList: readonly BackgroundLayerDescriptor[] = BackgroundLayerIDOrder.map(
    (LayerID: BackgroundLayerIDType): BackgroundLayerDescriptor => BackgroundLayerDescriptors[LayerID]
  );

  public readonly MotionItems: Signal<FancyMultibuttonItemType[]> = computed((): FancyMultibuttonItemType[] => {
    const Dictionary: TranslationDictionary = this.InterfaceService.T();

    return [
      { ID: 'Static',   Label: Dictionary.BackgroundMotionStaticLabel   ?? BackgroundTextDictionary.MotionStaticLabel },
      { ID: 'Ambient',  Label: Dictionary.BackgroundMotionAmbientLabel  ?? BackgroundTextDictionary.MotionAmbientLabel },
      { ID: 'Evolving', Label: Dictionary.BackgroundMotionEvolvingLabel ?? BackgroundTextDictionary.MotionEvolvingLabel },
    ];
  });

  public readonly ModeMultibuttonItems: Signal<FancyMultibuttonItemType[]> = computed((): FancyMultibuttonItemType[] => {
    const Dictionary: TranslationDictionary = this.InterfaceService.T();
    const IncludeSiteDefault: boolean = this.AllowSiteDefaultMode();
    const Items: FancyMultibuttonItemType[] = [];

    if (IncludeSiteDefault) {
      Items.push({
        ID:    'SiteDefault',
        Label: Dictionary.BackgroundModeSiteDefaultLabel ?? BackgroundTextDictionary.ModeSiteDefaultLabel,
      });
    }

    Items.push(
      { ID: 'Random', Label: Dictionary.BackgroundModeRandomLabel ?? BackgroundTextDictionary.ModeRandomLabel },
      { ID: 'Custom', Label: Dictionary.BackgroundModeCustomLabel ?? BackgroundTextDictionary.ModeCustomLabel }
    );

    return Items;
  });

  public readonly CurrentModeID: Signal<VisitorBackgroundPreferenceModeType | BackgroundConfigurationModeType> = computed(
    (): (VisitorBackgroundPreferenceModeType | BackgroundConfigurationModeType) => {
      if (this.AllowSiteDefaultMode()) {
        return (this.BackgroundService.VisitorOverride().Mode);
      }

      return ((this.Scope()) === 'Admin')
        ? (this.BackgroundService.AdminConfiguration().Mode)
        : (this.BackgroundService.PublicDefaultConfiguration().Mode);
    }
  );

  public readonly SelectedModeIndex: Signal<number> = computed((): number => {
    const ModeID: string = this.CurrentModeID();
    const Items: FancyMultibuttonItemType[] = this.ModeMultibuttonItems();
    const FoundIndex: number = Items.findIndex((Item: FancyMultibuttonItemType): boolean => ((Item.ID) === ModeID));

    return (FoundIndex >= 0) ? FoundIndex : 0;
  });

  public readonly DisplayedLayersMap: Signal<BackgroundLayersMap> = computed((): BackgroundLayersMap => {
    if ((this.Scope()) === 'Admin') {
      return this.BackgroundService.EffectiveAdminLayers();
    }

    if (this.AllowSiteDefaultMode()) {
      return this.BackgroundService.EffectivePublicLayers();
    }

    const PublicConfiguration = this.BackgroundService.PublicDefaultConfiguration();

    return ((PublicConfiguration.Mode) === 'Custom')
      ? (PublicConfiguration.Layers)
      : this.BackgroundService.PublicRandomRoll();
  });

  public readonly ActiveLayerCount: Signal<number> = computed((): number => {
    const Layers: BackgroundLayersMap = this.DisplayedLayersMap();

    return BackgroundLayerIDOrder.filter((ID: BackgroundLayerIDType): boolean => Boolean(Layers[ID]?.Enabled)).length;
  });

  public GetLayerSettings(LayerID: BackgroundLayerIDType): BackgroundLayerSettings {
    return this.DisplayedLayersMap()[LayerID];
  }

  public GetLayerName(Descriptor: BackgroundLayerDescriptor): string {
    const Dictionary: TranslationDictionary = this.InterfaceService.T();
    const Key: keyof TranslationDictionary = `BackgroundLayer_${Descriptor.ID}_Name` as keyof TranslationDictionary;

    return (Dictionary[Key] as string) ?? Descriptor.Name;
  }

  public GetLayerDescription(Descriptor: BackgroundLayerDescriptor): string {
    const Dictionary: TranslationDictionary = this.InterfaceService.T();
    const Key: keyof TranslationDictionary = `BackgroundLayer_${Descriptor.ID}_Description` as keyof TranslationDictionary;

    return (Dictionary[Key] as string) ?? Descriptor.Description;
  }

  public GetMotionIndex(Motion: BackgroundMotionModeType): number {
    const Index: number = BackgroundMotionModes.indexOf(Motion);

    return (Index >= 0) ? Index : 1;
  }

  public OnSelectModeIndex(Index: number): void {
    const Items: FancyMultibuttonItemType[] = this.ModeMultibuttonItems();
    const Chosen: Undefinable<FancyMultibuttonItemType> = Items[Index];
    if (!Chosen || !(Chosen.ID)) return;

    if (this.AllowSiteDefaultMode()) {
      this.BackgroundService.SetVisitorMode(Chosen.ID as VisitorBackgroundPreferenceModeType);

      return;
    }

    this.BackgroundService.SetScopeConfigurationMode(
      this.Scope(),
      Chosen.ID as BackgroundConfigurationModeType,
      this.PersistImmediately()
    );
  }

  public OnReroll(): void {
    if (this.AllowSiteDefaultMode()) {
      this.BackgroundService.SetVisitorMode('Random');

      return;
    }

    this.BackgroundService.SetScopeConfigurationMode(
      this.Scope(),
      'Random',
      this.PersistImmediately()
    );
  }

  public OnReset(): void {
    if (this.AllowSiteDefaultMode()) {
      this.BackgroundService.ResetVisitorOverride();

      return;
    }

    this.BackgroundService.ResetScopeConfiguration(
      this.Scope(),
      this.PersistImmediately()
    );
  }

  public OnToggleLayer(LayerID: BackgroundLayerIDType, Enabled: boolean): void {
    this.UpdateLayer(LayerID, { Enabled });
  }

  public OnSelectMotionIndex(LayerID: BackgroundLayerIDType, MotionIndex: number): void {
    const ChosenMotion: BackgroundMotionModeType = BackgroundMotionModes[MotionIndex] ?? 'Ambient';
    this.UpdateLayer(LayerID, { Motion: ChosenMotion });
  }

  public OnChangeIntensity(LayerID: BackgroundLayerIDType, Intensity: number): void {
    this.UpdateLayer(LayerID, { Intensity: Math.round(Intensity) });
  }

  public OnChangeDensity(LayerID: BackgroundLayerIDType, Density: number): void {
    this.UpdateLayer(LayerID, { Density: Math.round(Density) });
  }

  private UpdateLayer(
    LayerID: BackgroundLayerIDType,
    PartialSettings: Partial<BackgroundLayerSettings>
  ): void {
    if (this.AllowSiteDefaultMode()) {
      this.BackgroundService.UpdateVisitorLayer(LayerID, PartialSettings);

      return;
    }

    this.BackgroundService.UpdateScopeLayer(
      this.Scope(),
      LayerID,
      PartialSettings,
      this.PersistImmediately()
    );
  }
}
