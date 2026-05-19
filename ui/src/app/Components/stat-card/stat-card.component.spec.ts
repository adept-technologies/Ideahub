/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';
import { By } from '@angular/platform-browser';
import { provideIcons } from '@ng-icons/core';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
      providers: [provideIcons({})],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs Rendering', () => {
    it('should display the correct label text', () => {
      component.label = 'Active Users';
      fixture.detectChanges();

      const labelEl = fixture.debugElement.query(By.css('.stat-label'));
      expect(labelEl).toBeTruthy();
      expect(labelEl.nativeElement.textContent.trim()).toBe('Active Users');
    });

    it('should display the correct value when it is a number', () => {
      component.value = 1530;
      fixture.detectChanges();

      const valueEl = fixture.debugElement.query(By.css('.stat-value'));
      expect(valueEl).toBeTruthy();
      expect(valueEl.nativeElement.textContent.trim()).toBe('1530');
    });

    it('should display the correct value when it is a string', () => {
      component.value = '$45,200';
      fixture.detectChanges();

      const valueEl = fixture.debugElement.query(By.css('.stat-value'));
      expect(valueEl).toBeTruthy();
      expect(valueEl.nativeElement.textContent.trim()).toBe('$45,200');
    });

    it('should bind the dynamic icon name to the ng-icon component', () => {
      component.icon = 'heroUsers';
      fixture.detectChanges();

      const iconComponent = fixture.debugElement.query(By.css('ng-icon'));
      expect(iconComponent).toBeTruthy();
      
      const nameVal = typeof iconComponent.componentInstance.name === 'function'
        ? iconComponent.componentInstance.name()
        : iconComponent.componentInstance.name;
        
      expect(nameVal).toBe('heroUsers');
    });

    it('should apply the matching CSS variant class to the parent stat-card container', () => {
      component.variant = 'variant-success';
      fixture.detectChanges();

      const containerEl = fixture.debugElement.query(By.css('.stat-card'));
      expect(containerEl).toBeTruthy();
      expect(containerEl.nativeElement.classList.contains('variant-success')).toBeTrue();

      // Check another variant
      component.variant = 'variant-warning';
      fixture.detectChanges();
      expect(containerEl.nativeElement.classList.contains('variant-warning')).toBeTrue();
      expect(containerEl.nativeElement.classList.contains('variant-success')).toBeFalse();
    });
  });
});
