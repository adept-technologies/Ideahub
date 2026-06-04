/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { EditProjectModalComponent } from './edit-project-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import {
  Project,
  ProjectStatus,
} from '../../../Interfaces/Projects/project-interface';

describe('EditProjectModalComponent', () => {
  let component: EditProjectModalComponent;
  let fixture: ComponentFixture<EditProjectModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<EditProjectModalComponent>>;
  let mockProject: Project;

  beforeEach(async () => {
    mockProject = {
      id: 101,
      title: 'Infrastructure Hardening',
      description: 'Strengthen intranet firewalls and endpoints.',
      status: ProjectStatus.Active,
      createdAt: '2026-01-01T12:00:00Z',
      endedAt: '2026-06-30T12:00:00Z',
      overseenBy: 'Alice Vance',
      overseenById: 'user-admin-1',
      progress: 45,
    };

    mockDialogRef = jasmine.createSpyObj<
      MatDialogRef<EditProjectModalComponent>
    >('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [EditProjectModalComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { project: mockProject } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create the edit project modal component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Cloned Data Isolation', () => {
    it('should clone the injected project data on startup', () => {
      expect(component.editedProject).toEqual(mockProject);
      expect(component.editedProject).not.toBe(mockProject); // Must be a clone, not same reference
    });

    it('should correctly format status enum keys into human labels', () => {
      expect(component.getStatusLabel(ProjectStatus.Planning)).toBe('Planning');
      expect(component.getStatusLabel(ProjectStatus.Active)).toBe('Active');
      expect(component.getStatusLabel(ProjectStatus.Completed)).toBe(
        'Completed',
      );
    });

    it('should parse valid status enum options in statusOptions getter', () => {
      // Should filter out string reverse-mappings and only contain number indices [0, 1, 2, 3, 4]
      expect(component.statusOptions).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('Modal Actions', () => {
    it('should close the dialog ref and pass back cloned project details onSave', () => {
      component.editedProject.description = 'Updated Description';
      component.onSave();

      expect(mockDialogRef.close).toHaveBeenCalledWith(component.editedProject);
    });

    it('should close the dialog ref without any arguments onCancel', () => {
      component.onCancel();

      expect(mockDialogRef.close).toHaveBeenCalledWith();
      expect(mockDialogRef.close).not.toHaveBeenCalledWith(
        component.editedProject,
      );
    });

    it('should trigger onSave when the Save Changes button is clicked in the template', () => {
      spyOn(component, 'onSave').and.callThrough();

      const saveButton = fixture.debugElement.query(
        By.css('mat-dialog-actions button[color="primary"]'),
      );
      expect(saveButton).toBeTruthy();

      saveButton.nativeElement.click();
      expect(component.onSave).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should trigger onCancel when the Cancel button is clicked in the template', () => {
      spyOn(component, 'onCancel').and.callThrough();

      const cancelButton = fixture.debugElement.query(
        By.css('mat-dialog-actions button:not([color])'),
      );
      expect(cancelButton).toBeTruthy();

      cancelButton.nativeElement.click();
      expect(component.onCancel).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Template Content and Form Fields', () => {
    it('should display the header title Edit Project', () => {
      const titleEl = fixture.debugElement.query(By.css('[mat-dialog-title]'));
      expect(titleEl).toBeTruthy();
      expect(titleEl.nativeElement.textContent.trim()).toBe('Edit Project');
    });

    it('should render the project title input as disabled', () => {
      const titleInput = fixture.debugElement.query(
        By.css('input[matInput][disabled]'),
      );
      expect(titleInput).toBeTruthy();
    });
  });
});
