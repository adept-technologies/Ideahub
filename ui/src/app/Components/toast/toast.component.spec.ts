/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService, Toast } from '../../Services/toast.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let toastsSubject: BehaviorSubject<Toast[]>;

  beforeEach(async () => {
    toastsSubject = new BehaviorSubject<Toast[]>([]);

    mockToastService = jasmine.createSpyObj<ToastService>('ToastService', ['remove'], {
      toasts$: toastsSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Toast Rendering', () => {
    it('should render an empty container by default when there are no toasts', () => {
      const container = fixture.debugElement.query(By.css('.toast-container'));
      const toastItems = fixture.debugElement.queryAll(By.css('.toast'));

      expect(container).toBeTruthy();
      expect(toastItems.length).toBe(0);
    });

    it('should dynamically render multiple toasts when they are emitted', () => {
      const mockToasts: Toast[] = [
        { id: 1, message: 'Operation successful', type: 'success' },
        { id: 2, message: 'An error occurred', type: 'error' },
      ];

      toastsSubject.next(mockToasts);
      fixture.detectChanges();

      const toastItems = fixture.debugElement.queryAll(By.css('.toast'));
      expect(toastItems.length).toBe(2);

      expect(toastItems[0].query(By.css('.message')).nativeElement.textContent.trim()).toBe('Operation successful');
      expect(toastItems[1].query(By.css('.message')).nativeElement.textContent.trim()).toBe('An error occurred');
    });

    it('should apply the matching CSS class for each toast type', () => {
      const mockToasts: Toast[] = [
        { id: 10, message: 'Success', type: 'success' },
        { id: 11, message: 'Error', type: 'error' },
        { id: 12, message: 'Warning', type: 'warning' },
        { id: 13, message: 'Info', type: 'info' },
      ];

      toastsSubject.next(mockToasts);
      fixture.detectChanges();

      const toastItems = fixture.debugElement.queryAll(By.css('.toast'));

      expect(toastItems[0].nativeElement.classList.contains('success')).toBeTrue();
      expect(toastItems[1].nativeElement.classList.contains('error')).toBeTrue();
      expect(toastItems[2].nativeElement.classList.contains('warning')).toBeTrue();
      expect(toastItems[3].nativeElement.classList.contains('info')).toBeTrue();
    });

    it('should render the correct icon character based on toast type', () => {
      const mockToasts: Toast[] = [
        { id: 20, message: 'S', type: 'success' },
        { id: 21, message: 'E', type: 'error' },
        { id: 22, message: 'W', type: 'warning' },
        { id: 23, message: 'I', type: 'info' },
      ];

      toastsSubject.next(mockToasts);
      fixture.detectChanges();

      const toastItems = fixture.debugElement.queryAll(By.css('.toast'));

      expect(toastItems[0].query(By.css('.icon')).nativeElement.textContent.trim()).toBe('✓');
      expect(toastItems[1].query(By.css('.icon')).nativeElement.textContent.trim()).toBe('✕');
      expect(toastItems[2].query(By.css('.icon')).nativeElement.textContent.trim()).toBe('!');
      expect(toastItems[3].query(By.css('.icon')).nativeElement.textContent.trim()).toBe('i');
    });
  });

  describe('User Dismissal Interactions', () => {
    beforeEach(() => {
      toastsSubject.next([{ id: 99, message: 'Dismiss me', type: 'info' }]);
      fixture.detectChanges();
    });

    it('should call toastService.remove with the correct id when clicked', () => {
      const toastEl = fixture.debugElement.query(By.css('.toast'));
      toastEl.nativeElement.click();

      expect(mockToastService.remove).toHaveBeenCalledWith(99);
    });

    it('should call toastService.remove with the correct id when pressing enter on the element', () => {
      const toastEl = fixture.debugElement.query(By.css('.toast'));
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      toastEl.nativeElement.dispatchEvent(event);

      expect(mockToastService.remove).toHaveBeenCalledWith(99);
    });

    it('should render correct interactive aria tags and tabindex for accessibility', () => {
      const toastEl = fixture.debugElement.query(By.css('.toast'));
      
      expect(toastEl.nativeElement.getAttribute('tabindex')).toBe('0');
      expect(toastEl.nativeElement.getAttribute('role')).toBe('button');
      expect(toastEl.nativeElement.getAttribute('aria-label')).toBe('Dismiss toast');
    });
  });
});
