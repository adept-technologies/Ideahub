/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ButtonsComponent } from './buttons.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('ButtonsComponent', () => {
  let component: ButtonsComponent;
  let fixture: ComponentFixture<ButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Standard Button (No Link)', () => {
    it('should render a regular button element when buttonLink is empty', () => {
      component.buttonText = 'Click Me';
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      const anchorEl = fixture.debugElement.query(By.css('a'));

      expect(buttonEl).toBeTruthy();
      expect(anchorEl).toBeNull();
      expect(buttonEl.nativeElement.textContent.trim()).toBe('Click Me');
    });

    it('should set the button type dynamically', () => {
      component.buttonType = 'submit';
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      expect(buttonEl.nativeElement.getAttribute('type')).toBe('submit');
    });

    it('should apply the specified style class', () => {
      component.buttonStyleClass = 'btn-primary';
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      expect(
        buttonEl.nativeElement.classList.contains('btn-primary'),
      ).toBeTrue();
    });

    it('should be disabled when the disabled input is true', () => {
      component.disabled = true;
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      expect(buttonEl.nativeElement.disabled).toBeTrue();
    });

    it('should show the spinner and disable the button when isLoading is true', () => {
      component.buttonText = 'Submit';
      component.isLoading = true;
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      const spinnerEl = fixture.debugElement.query(By.css('.spinner'));

      expect(buttonEl.nativeElement.disabled).toBeTrue();
      expect(spinnerEl).toBeTruthy();
      expect(buttonEl.nativeElement.textContent.trim()).not.toContain('Submit');
    });

    it('should carry the title attribute if provided', () => {
      component.title = 'Hover Tooltip';
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      expect(buttonEl.nativeElement.getAttribute('title')).toBe(
        'Hover Tooltip',
      );
    });
  });

  describe('Link Button (With Link)', () => {
    beforeEach(() => {
      component.buttonLink = '/dashboard';
      component.buttonText = 'Go to Dashboard';
      fixture.detectChanges();
    });

    it('should render an anchor tag with the routerLink directive', () => {
      const anchorEl = fixture.debugElement.query(By.css('a'));
      const buttonEl = fixture.debugElement.query(By.css('button'));

      expect(anchorEl).toBeTruthy();
      expect(buttonEl).toBeTruthy();
      expect(anchorEl.nativeElement.getAttribute('href')).toBe('/dashboard');
      expect(buttonEl.nativeElement.textContent.trim()).toBe('Go to Dashboard');
    });

    it('should apply the style class to the inner button when buttonLink is set', () => {
      component.buttonStyleClass = 'btn-danger';
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      expect(
        buttonEl.nativeElement.classList.contains('btn-danger'),
      ).toBeTrue();
    });

    it('should disable the inner button when disabled input is true', () => {
      component.disabled = true;
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button'));
      expect(buttonEl.nativeElement.disabled).toBeTrue();
    });
  });
});
