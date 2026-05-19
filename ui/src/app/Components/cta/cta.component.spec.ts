/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CtaComponent } from './cta.component';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ButtonsComponent } from '../buttons/buttons.component';

describe('CtaComponent', () => {
  let component: CtaComponent;
  let fixture: ComponentFixture<CtaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CtaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the cta component', () => {
    expect(component).toBeTruthy();
  });

  describe('Static Content Rendering', () => {
    it('should render the welcome header', () => {
      const headerEl = fixture.debugElement.query(By.css('.cta-header h1.header-text'));
      expect(headerEl).toBeTruthy();
      expect(headerEl.nativeElement.textContent.trim()).toBe('Welcome To Ideahub');
    });

    it('should render the subheader supporting text', () => {
      const subheaderEl = fixture.debugElement.query(By.css('.cta-subheader p.subheader-text'));
      expect(subheaderEl).toBeTruthy();
      expect(subheaderEl.nativeElement.textContent.trim()).toBe('Your Ideas Matter');
    });
  });

  describe('Action Button Rendering', () => {
    it('should render the ButtonsComponent wrapper with registration parameters', () => {
      const buttonComponentEl = fixture.debugElement.query(By.css('app-buttons'));
      expect(buttonComponentEl).toBeTruthy();

      const buttonInstance = buttonComponentEl.componentInstance as ButtonsComponent;
      expect(buttonInstance).toBeTruthy();
      expect(buttonInstance.buttonText).toBe('Click Here To Sign Up');
      expect(buttonInstance.buttonStyleClass).toBe('btn-cta-signup');
      expect(buttonInstance.buttonLink).toBe('/register');
    });
  });
});
