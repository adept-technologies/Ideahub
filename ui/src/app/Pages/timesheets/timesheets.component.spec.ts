/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TimesheetsComponent } from './timesheets.component';
import { TimesheetService } from '../../Services/timesheet.service';
import { MediaService } from '../../Services/media.service';
import { ToastService } from '../../Services/toast.service';
import { AuthService } from '../../Services/auth/auth.service';
import {
  ActivatedRoute,
  provideRouter,
  convertToParamMap,
} from '@angular/router';
import {
  TimesheetDto,
  RelevantTask,
  BlockerSeverity,
} from '../../Interfaces/Timesheet/timesheet-interface';
import { MediaType } from '../../Interfaces/Media/media-interface';
import { of } from 'rxjs';

describe('TimesheetsComponent', () => {
  let component: TimesheetsComponent;
  let fixture: ComponentFixture<TimesheetsComponent>;

  let mockTimesheetService: jasmine.SpyObj<TimesheetService>;
  let mockMediaService: jasmine.SpyObj<MediaService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  let mockTasks: RelevantTask[];
  let mockLogs: TimesheetDto[];
  let mockTeam: { id: string; name: string }[];

  beforeEach(async () => {
    mockTasks = [
      { id: 1, title: 'Database Relational Tables' },
      { id: 2, title: 'Auth0 SSO flows' },
    ];

    mockTeam = [
      { id: 'u1', name: 'Alice Vance' },
      { id: 'u2', name: 'Bob Member' },
    ];

    mockLogs = [
      {
        id: 50,
        taskId: 1,
        userId: 'u1',
        userName: 'Alice Vance',
        workDate: new Date('2026-05-18T00:00:00Z'),
        description: 'Worked on database migrations.',
        hoursSpent: 4,
        comments: 'All went well.',
        hasBlocker: false,
        blockerDescription: '',
        blockerSeverity: BlockerSeverity.Low,
      },
      {
        id: 51,
        taskId: 2,
        userId: 'u2',
        userName: 'Bob Member',
        workDate: new Date('2026-05-19T00:00:00Z'),
        description: 'Worked on claims mapping.',
        hoursSpent: 6,
        comments: 'Blocker on tokens.',
        hasBlocker: true,
        blockerDescription: 'Auth0 delay.',
        blockerSeverity: BlockerSeverity.High,
      },
    ];

    mockTimesheetService = jasmine.createSpyObj('TimesheetService', [
      'getRelevantTasks',
      'getProjectLogs',
      'getProjectTeam',
      'updateLog',
      'bulkLogWork',
      'deleteLog',
    ]);
    mockMediaService = jasmine.createSpyObj('MediaService', [
      'detectMediaType',
      'uploadMedia',
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);

    mockAuthService.getUserId.and.returnValue(of('u1'));
    mockTimesheetService.getRelevantTasks.and.returnValue(
      of({ success: true, message: '', data: mockTasks }),
    );
    mockTimesheetService.getProjectLogs.and.returnValue(
      of({ success: true, message: '', data: mockLogs }),
    );
    mockTimesheetService.getProjectTeam.and.returnValue(
      of({ success: true, message: '', data: mockTeam }),
    );
    mockTimesheetService.bulkLogWork.and.returnValue(
      of({
        success: true,
        message: '',
        data: { createdIds: [52], invalidRows: [] },
      }),
    );
    mockTimesheetService.updateLog.and.returnValue(
      of({ success: true, message: '' }),
    );
    mockTimesheetService.deleteLog.and.returnValue(
      of({ success: true, message: '' }),
    );

    mockMediaService.detectMediaType.and.returnValue(MediaType.Image);
    mockMediaService.uploadMedia.and.returnValue(
      of({ success: true, message: '' }),
    );

    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ projectId: '100' }),
      },
    };

    await TestBed.configureTestingModule({
      imports: [TimesheetsComponent],
      providers: [
        provideRouter([]),
        { provide: TimesheetService, useValue: mockTimesheetService },
        { provide: MediaService, useValue: mockMediaService },
        { provide: ToastService, useValue: mockToastService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimesheetsComponent);
    component = fixture.componentInstance;
  });

  it('should create the timesheets component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization and loaders', () => {
    it('should load initial tasks, team, logs, currentUserId and insert an empty row', () => {
      fixture.detectChanges(); // Triggers ngOnInit

      expect(component.projectId).toBe(100);
      expect(component.currentUserId).toBe('u1');
      expect(component.availableTasks).toEqual(mockTasks);
      expect(component.recentLogs).toEqual(mockLogs);
      expect(component.projectMembers).toEqual(mockTeam);
      expect(component.rows.length).toBe(1); // Starts with one empty row
    });
  });

  describe('Filtering Logs State', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter recent logs list by userId, dates, or blocker severity', () => {
      // User Filter
      component.filterUserId = 'u2';
      expect(component.filteredLogs.length).toBe(1);
      expect(component.filteredLogs[0].id).toBe(51);

      // Severity Filter
      component.filterUserId = '';
      component.filterSeverity = 'High';
      expect(component.filteredLogs.length).toBe(1);
      expect(component.filteredLogs[0].id).toBe(51);

      // Clear Filters
      component.clearFilters();
      expect(component.filteredLogs.length).toBe(2);
    });
  });

  describe('Row Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add rows and restrict deletion below 1 row', () => {
      expect(component.rows.length).toBe(1);

      component.addRow();
      expect(component.rows.length).toBe(2);

      component.removeRow(1);
      expect(component.rows.length).toBe(1);

      component.removeRow(0); // Should not remove when length is 1
      expect(component.rows.length).toBe(1);
    });
  });

  describe('Submitting and Editing Logs', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show warning toast and block submission when hoursSpent are 0', async () => {
      component.rows[0].taskId = 1;
      component.rows[0].hoursSpent = 0;

      await component.submitLogs();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Please fill in at least one task with hours',
        'warning',
      );
      expect(mockTimesheetService.bulkLogWork).not.toHaveBeenCalled();
    });

    it('should submit bulk log work successfully and reload list', async () => {
      component.rows[0].taskId = 1;
      component.rows[0].hoursSpent = 4;
      component.rows[0].description = 'Bulk submission';

      await component.submitLogs();

      expect(mockTimesheetService.bulkLogWork).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Timesheet submitted successfully',
        'success',
      );
      expect(component.rows.length).toBe(1); // Reset to one empty row
    });

    it('should edit logs, set row values, and handle single row update submissions', async () => {
      const editTarget = mockLogs[0]; // ID: 50
      component.editLog(editTarget);

      expect(component.isEditing).toBeTrue();
      expect(component.editingLogId).toBe(50);
      expect(component.rows[0].taskId).toBe(editTarget.taskId || 0);

      // Submit edited row
      component.rows[0].hoursSpent = 5; // Updated hours
      await component.submitLogs();

      expect(mockTimesheetService.updateLog).toHaveBeenCalledWith(
        50,
        jasmine.objectContaining({
          hoursSpent: 5,
        }),
      );
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Timesheet updated successfully',
        'success',
      );
      expect(component.isEditing).toBeFalse();
    });
  });

  describe('Deleting Logs', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display confirmation modal and execute deleteLog endpoint successfully', async () => {
      await component.deleteLog(50);

      expect(component.logToDeleteId).toBe(50);
      expect(component.showDeleteModal).toBeTrue();

      await component.confirmDelete();

      expect(mockTimesheetService.deleteLog).toHaveBeenCalledWith(50);
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Log deleted successfully',
        'success',
      );
      expect(component.showDeleteModal).toBeFalse();
    });
  });
});
