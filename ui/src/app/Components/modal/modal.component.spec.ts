/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { By } from '@angular/platform-browser';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Visibility and Structural Elements', () => {
    it('should not render anything in the DOM by default (isOpen is false)', () => {
      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(overlay).toBeNull();
    });

    it('should render the modal overlay and structure when isOpen is true', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      const modal = fixture.debugElement.query(By.css('.modal'));
      const body = fixture.debugElement.query(By.css('.modal-body'));

      expect(overlay).toBeTruthy();
      expect(modal).toBeTruthy();
      expect(body).toBeTruthy();
    });

    it('should render a title in the header if provided', () => {
      component.isOpen = true;
      component.title = 'Confirm Deletion';
      fixture.detectChanges();

      const titleEl = fixture.debugElement.query(By.css('.modal-header h3'));
      expect(titleEl).toBeTruthy();
      expect(titleEl.nativeElement.textContent.trim()).toBe('Confirm Deletion');
    });

    it('should not render an h3 title in the header if empty', () => {
      component.isOpen = true;
      component.title = '';
      fixture.detectChanges();

      const titleEl = fixture.debugElement.query(By.css('.modal-header h3'));
      expect(titleEl).toBeNull();
    });

    it('should render the close button by default and omit it when showCloseButton is false', () => {
      component.isOpen = true;
      fixture.detectChanges();

      let closeBtn = fixture.debugElement.query(By.css('.btn-modal-close'));
      expect(closeBtn).toBeTruthy();

      component.showCloseButton = false;
      fixture.detectChanges();

      closeBtn = fixture.debugElement.query(By.css('.btn-modal-close'));
      expect(closeBtn).toBeNull();
    });

    it('should render the footer by default and omit it when showFooter is false', () => {
      component.isOpen = true;
      fixture.detectChanges();

      let footer = fixture.debugElement.query(By.css('.modal-footer'));
      expect(footer).toBeTruthy();

      component.showFooter = false;
      fixture.detectChanges();

      footer = fixture.debugElement.query(By.css('.modal-footer'));
      expect(footer).toBeNull();
    });
  });

  describe('Sizing and Custom Styling Classes', () => {
    beforeEach(() => {
      component.isOpen = true;
    });

    it('should apply the correct sizing class based on size input', () => {
      const sizes: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];

      sizes.forEach((sz) => {
        component.size = sz;
        fixture.detectChanges();

        const modalEl = fixture.debugElement.query(By.css('.modal'));
        expect(
          modalEl.nativeElement.classList.contains(`modal-${sz}`),
        ).toBeTrue();
      });
    });

    it('should append custom modalClass and overlayClass when provided', () => {
      component.modalClass = 'custom-modal-layout';
      component.overlayClass = 'custom-dark-overlay';
      fixture.detectChanges();

      const overlayEl = fixture.debugElement.query(By.css('.modal-overlay'));
      const modalEl = fixture.debugElement.query(By.css('.modal'));

      expect(
        overlayEl.nativeElement.classList.contains('custom-dark-overlay'),
      ).toBeTrue();
      expect(
        modalEl.nativeElement.classList.contains('custom-modal-layout'),
      ).toBeTrue();
    });
  });

  describe('Dismissal Mechanisms', () => {
    let closeModalSpy: jasmine.Spy;

    beforeEach(() => {
      component.isOpen = true;
      closeModalSpy = spyOn(component.closeModal, 'emit');
      fixture.detectChanges();
    });

    it('should emit closeModal when close() is called', () => {
      component.close();
      expect(closeModalSpy).toHaveBeenCalled();
    });

    it('should emit closeModal when clicking the header close button', () => {
      const closeBtn = fixture.debugElement.query(By.css('.btn-modal-close'));
      closeBtn.nativeElement.click();

      expect(closeModalSpy).toHaveBeenCalled();
    });

    it('should emit closeModal when clicking the overlay with closeOnOverlayClick = true', () => {
      const overlayEl = fixture.debugElement.query(By.css('.modal-overlay'));

      // Simulate click specifically on the overlay container
      const event = new MouseEvent('click', { bubbles: true });
      spyOnProperty(event, 'target', 'get').and.returnValue(
        overlayEl.nativeElement,
      );
      overlayEl.nativeElement.dispatchEvent(event);

      expect(closeModalSpy).toHaveBeenCalled();
    });

    it('should not emit closeModal when clicking inside the modal content box', () => {
      const modalEl = fixture.debugElement.query(By.css('.modal'));

      // Simulate click on the modal container itself
      const event = new MouseEvent('click', { bubbles: true });
      spyOnProperty(event, 'target', 'get').and.returnValue(
        modalEl.nativeElement,
      );
      modalEl.nativeElement.dispatchEvent(event);

      expect(closeModalSpy).not.toHaveBeenCalled();
    });

    it('should not emit closeModal on overlay click if closeOnOverlayClick is false', () => {
      component.closeOnOverlayClick = false;
      fixture.detectChanges();

      const overlayEl = fixture.debugElement.query(By.css('.modal-overlay'));

      const event = new MouseEvent('click', { bubbles: true });
      spyOnProperty(event, 'target', 'get').and.returnValue(
        overlayEl.nativeElement,
      );
      overlayEl.nativeElement.dispatchEvent(event);

      expect(closeModalSpy).not.toHaveBeenCalled();
    });

    it('should emit closeModal on Escape key press if closeOnEsc is true', () => {
      // Trigger host listener event on document
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(closeModalSpy).toHaveBeenCalled();
    });

    it('should not emit closeModal on Escape key press if closeOnEsc is false', () => {
      component.closeOnEsc = false;
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(closeModalSpy).not.toHaveBeenCalled();
    });

    it('should not emit closeModal on Escape key press if the modal is already closed', () => {
      component.isOpen = false;
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(closeModalSpy).not.toHaveBeenCalled();
    });
  });
});
