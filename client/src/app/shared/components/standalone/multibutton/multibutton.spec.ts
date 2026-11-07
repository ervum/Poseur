import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultibuttonComponent } from './multibutton';



describe('MultibuttonComponent', () => {
  let component: MultibuttonComponent;
  let fixture: ComponentFixture<MultibuttonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultibuttonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultibuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
