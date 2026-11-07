import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuroraComponent } from './aurora';



describe('AuroraComponent', () => {
  let component: AuroraComponent;
  let fixture: ComponentFixture<AuroraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuroraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuroraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
