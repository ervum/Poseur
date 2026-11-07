import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button';



describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should support HasIcon=true hover and click', () => {
    fixture.componentRef.setInput('HasIcon', true);
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('.FancyButton');
    expect(buttonElement).toBeTruthy();

    buttonElement.dispatchEvent(new PointerEvent('pointerenter'));
    fixture.detectChanges();

    buttonElement.dispatchEvent(new PointerEvent('pointerdown'));
    fixture.detectChanges();

    expect(component.IconStatus).toBe('Exiting');
  });
});
