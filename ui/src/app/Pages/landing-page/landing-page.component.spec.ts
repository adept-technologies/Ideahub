/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { By } from '@angular/platform-browser';

import { provideRouter } from '@angular/router';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the landing page component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the landing container and app-cta child component', () => {
    const landingEl = fixture.debugElement.query(By.css('.landing-page'));
    expect(landingEl).toBeTruthy();

    const ctaEl = fixture.debugElement.query(By.css('app-cta'));
    expect(ctaEl).toBeTruthy();
  });
});
