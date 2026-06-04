/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the footer component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute the current calendar year dynamically', () => {
    const currentYear = new Date().getFullYear();
    expect(component.year).toBe(currentYear);
  });

  it('should display the correct brand and copyright statement in the template', () => {
    const currentYear = new Date().getFullYear();
    const footerTextEl = fixture.debugElement.query(By.css('.footer-text'));

    expect(footerTextEl).toBeTruthy();
    expect(footerTextEl.nativeElement.textContent.trim()).toBe(
      `${currentYear} Ideahub. All Rights Reserved`,
    );
  });
});
