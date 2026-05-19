/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DashboardCardComponent } from './dashboard-card.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideIcons } from '@ng-icons/core';

@Component({
  template: `
    <app-dashboard-card
      [title]="'My Widget'"
      [variant]="'dark-mode'"
      [icon]="'heroBell'"
    >
      <div id="projected-widget">Projected Dashboard Metric</div>
    </app-dashboard-card>
  `,
  imports: [DashboardCardComponent],
  standalone: true,
})
class TestHostComponent {}

describe('DashboardCardComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, DashboardCardComponent],
      providers: [provideIcons({})],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should create the dashboard card component', () => {
    const cardEl = hostFixture.debugElement.query(By.css('app-dashboard-card'));
    expect(cardEl).toBeTruthy();
  });

  describe('Inputs and Directives Bindings', () => {
    it('should display the correct card header title', () => {
      const headerTitleSpan = hostFixture.debugElement.query(
        By.css('.card-header span:not(.icon)'),
      );
      expect(headerTitleSpan).toBeTruthy();
      expect(headerTitleSpan.nativeElement.textContent.trim()).toBe(
        'My Widget',
      );
    });

    it('should apply the matching CSS variant class to the parent card container', () => {
      const cardContainerEl = hostFixture.debugElement.query(By.css('.card'));
      expect(cardContainerEl).toBeTruthy();
      expect(
        cardContainerEl.nativeElement.classList.contains('dark-mode'),
      ).toBeTrue();
    });

    it('should bind the dynamic icon name parameter (supporting Angular Signal Inputs)', () => {
      const iconComponent = hostFixture.debugElement.query(By.css('ng-icon'));
      expect(iconComponent).toBeTruthy();

      const nameVal =
        typeof iconComponent.componentInstance.name === 'function'
          ? iconComponent.componentInstance.name()
          : iconComponent.componentInstance.name;

      expect(nameVal).toBe('heroBell');
    });
  });

  describe('Content Projection', () => {
    it('should render the projected elements inside the card-content container', () => {
      const cardContentEl = hostFixture.debugElement.query(
        By.css('.card-content'),
      );
      expect(cardContentEl).toBeTruthy();

      const projectedEl = hostFixture.debugElement.query(
        By.css('#projected-widget'),
      );
      expect(projectedEl).toBeTruthy();
      expect(projectedEl.nativeElement.textContent.trim()).toBe(
        'Projected Dashboard Metric',
      );
    });
  });
});
