import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepBackgroundComponent } from './deep-background';



describe('DeepBackgroundComponent', () => {
  let component: DeepBackgroundComponent;
  let fixture: ComponentFixture<DeepBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeepBackgroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
