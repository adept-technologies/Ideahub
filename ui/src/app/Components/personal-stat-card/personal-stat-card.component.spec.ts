/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PersonalStatCardComponent } from './personal-stat-card.component';
import { By } from '@angular/platform-browser';
import { provideIcons } from '@ng-icons/core';

describe('PersonalStatCardComponent', () => {
  let component: PersonalStatCardComponent;
  let fixture: ComponentFixture<PersonalStatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalStatCardComponent],
      providers: [provideIcons({})],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalStatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the personal stat card component', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs Rendering', () => {
    it('should display the correct label text', () => {
      component.label = 'Pending Submissions';
      fixture.detectChanges();

      const labelEl = fixture.debugElement.query(By.css('.label'));
      expect(labelEl).toBeTruthy();
      expect(labelEl.nativeElement.textContent.trim()).toBe(
        'Pending Submissions',
      );
    });

    it('should display the correct value when it is a number', () => {
      component.value = 12;
      fixture.detectChanges();

      const valueEl = fixture.debugElement.query(By.css('.value'));
      expect(valueEl).toBeTruthy();
      expect(valueEl.nativeElement.textContent.trim()).toBe('12');
    });

    it('should display the correct value when it is a string', () => {
      component.value = '95%';
      fixture.detectChanges();

      const valueEl = fixture.debugElement.query(By.css('.value'));
      expect(valueEl).toBeTruthy();
      expect(valueEl.nativeElement.textContent.trim()).toBe('95%');
    });

    it('should bind the dynamic icon name to the ng-icon component', () => {
      component.icon = 'heroUserGroup';
      fixture.detectChanges();

      const iconComponent = fixture.debugElement.query(By.css('ng-icon'));
      expect(iconComponent).toBeTruthy();

      const nameVal =
        typeof iconComponent.componentInstance.name === 'function'
          ? iconComponent.componentInstance.name()
          : iconComponent.componentInstance.name;

      expect(nameVal).toBe('heroUserGroup');
    });
  });
});
