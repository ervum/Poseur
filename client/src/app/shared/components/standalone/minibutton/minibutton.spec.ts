import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinibuttonComponent } from './minibutton';



describe('MinibuttonComponent', () => {
  let component: MinibuttonComponent;
  let fixture: ComponentFixture<MinibuttonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinibuttonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinibuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
