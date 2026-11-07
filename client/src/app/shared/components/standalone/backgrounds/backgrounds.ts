import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  computed,
  type Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackgroundLayersMap, BackgroundLayerSettings } from '@ervum/types';

import { BackgroundService } from '../../../../core/services/background/background';
import { BackgroundPointerService } from '../../../../core/services/background/background-pointer';

import { DeepBackgroundComponent } from './deep-background/deep-background';
import { TopographicBackgroundLayerComponent } from './topographic/topographic';
import { BlueprintBackgroundLayerComponent } from './blueprint/blueprint';
import { CadastralBackgroundLayerComponent } from './cadastral/cadastral';
import { SilkBackgroundLayerComponent } from './silk/silk';
import { MeshBackgroundLayerComponent } from './mesh/mesh';
import { SpotlightBackgroundLayerComponent } from './spotlight/spotlight';
import { AuroraBackgroundLayerComponent } from './aurora/aurora';



@Component({
  selector: 'Backgrounds',
  standalone: true,
  imports: [
    CommonModule,
    DeepBackgroundComponent,
    TopographicBackgroundLayerComponent,
    BlueprintBackgroundLayerComponent,
    CadastralBackgroundLayerComponent,
    SilkBackgroundLayerComponent,
    MeshBackgroundLayerComponent,
    SpotlightBackgroundLayerComponent,
    AuroraBackgroundLayerComponent
  ],
  templateUrl: './backgrounds.html',
  styleUrl: './backgrounds.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundsComponent implements AfterViewInit, OnDestroy {
  private readonly HostReference: ElementRef<HTMLElement> = inject(ElementRef);
  public readonly BackgroundService: BackgroundService = inject(BackgroundService);
  private readonly PointerService: BackgroundPointerService = inject(BackgroundPointerService);

  public readonly Layers: Signal<BackgroundLayersMap> = this.BackgroundService.ActiveLayers;

  public readonly MeshLayer: Signal<BackgroundLayerSettings> = computed(
    (): BackgroundLayerSettings => (this.Layers().Mesh)
  );
  public readonly AuroraLayer: Signal<BackgroundLayerSettings> = computed(
    (): BackgroundLayerSettings => (this.Layers().Aurora)
  );
  public readonly TopographicLayer: Signal<BackgroundLayerSettings> = computed(
    (): BackgroundLayerSettings => (this.Layers().Topographic)
  );
  public readonly CadastralLayer: Signal<BackgroundLayerSettings> = computed(
    (): BackgroundLayerSettings => (this.Layers().Cadastral)
  );
  public readonly BlueprintLayer: Signal<BackgroundLayerSettings> = computed(
    (): BackgroundLayerSettings => (this.Layers().Blueprint)
  );
  public readonly SilkLayer: Signal<BackgroundLayerSettings> = computed(
    (): BackgroundLayerSettings => (this.Layers().Silk)
  );
  public readonly SpotlightLayer: Signal<BackgroundLayerSettings> = computed(
    (): BackgroundLayerSettings => (this.Layers().Spotlight)
  );

  public ngAfterViewInit(): void {
    this.PointerService.AttachHost(this.HostReference.nativeElement);
  }

  public ngOnDestroy(): void {
    this.PointerService.DetachHost();
  }
}
