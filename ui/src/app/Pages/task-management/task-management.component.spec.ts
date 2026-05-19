/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TaskManagementComponent } from './task-management.component';
import { TaskService } from '../../Services/task.service';
import { CommitteeMembersService } from '../../Services/committeemembers.service';
import { ToastService } from '../../Services/toast.service';
import { MediaService } from '../../Services/media.service';
import { ProjectService } from '../../Services/project.service';
import { AuthService } from '../../Services/auth/auth.service';
import { ActivatedRoute, Params, provideRouter } from '@angular/router';
import {
  TaskDetails,
  SubTaskDetails,
} from '../../Interfaces/Tasks/task-interface';
import { UserRecord } from '../../Interfaces/Users/user-interface';
import { of, throwError, BehaviorSubject } from 'rxjs';

describe('TaskManagementComponent', () => {
  let component: TaskManagementComponent;
  let fixture: ComponentFixture<TaskManagementComponent>;

  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockCommitteeService: jasmine.SpyObj<CommitteeMembersService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockMediaService: jasmine.SpyObj<MediaService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  let routeParamsSubject: BehaviorSubject<Params>;
  let mockTasks: TaskDetails[];
  let mockUsers: UserRecord[];

  beforeEach(async () => {
    mockTasks = [
      {
        id: 1,
        title: 'Design Database Schema',
        description: 'Relational migrations.',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        labels: 'Database,Backend',
        isCompleted: false,
        taskAssignees: ['u1'],
        subTasks: [
          {
            id: 10,
            title: 'Migration scripts',
            description: 'Liquibase config.',
            startDate: '2026-01-01',
            endDate: '2026-01-05',
            isCompleted: false,
            subTaskAssignees: ['u1'],
            parentSubTaskId: null,
          } as unknown as SubTaskDetails,
        ],
      } as unknown as TaskDetails,
    ];

    mockUsers = [
      {
        id: 'u1',
        email: 'alice@company.com',
        fullName: 'Alice Vance',
      } as unknown as UserRecord,
      {
        id: 'u2',
        email: 'bob@company.com',
        fullName: 'Bob Member',
      } as unknown as UserRecord,
    ];

    mockTaskService = jasmine.createSpyObj('TaskService', [
      'getProjectTasks',
      'createTask',
      'createSubTask',
      'updateSubTask',
      'updateTask',
      'deleteTask',
      'deleteSubTask',
    ]);
    mockCommitteeService = jasmine.createSpyObj('CommitteeMembersService', [
      'getAllUsers',
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockMediaService = jasmine.createSpyObj('MediaService', [
      'viewMedia',
      'uploadMedia',
    ]);
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getProjectById',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);

    routeParamsSubject = new BehaviorSubject<Params>({ projectId: '100' });

    mockAuthService.getUserId.and.returnValue(of('u1'));
    mockProjectService.getProjectById.and.returnValue(
      of({
        success: true,
        message: '',
        data: { id: 100, overseenByUserId: 'u1' } as never,
      }),
    );
    mockTaskService.getProjectTasks.and.returnValue(
      of({ success: true, message: '', data: mockTasks }),
    );
    mockCommitteeService.getAllUsers.and.returnValue(
      of({ success: true, message: '', data: mockUsers }),
    );
    mockMediaService.viewMedia.and.returnValue(
      of({ success: true, message: '', data: [] }),
    );
    mockMediaService.uploadMedia.and.returnValue(
      of({ success: true, message: '' }),
    );

    await TestBed.configureTestingModule({
      imports: [TaskManagementComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: mockTaskService },
        { provide: CommitteeMembersService, useValue: mockCommitteeService },
        { provide: ToastService, useValue: mockToastService },
        { provide: MediaService, useValue: mockMediaService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: { params: routeParamsSubject.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create the task management component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Parallel Initialization and loaders', () => {
    it('should successfully forkJoin all initial parameters and assign states', () => {
      fixture.detectChanges(); // Triggers ngOnInit -> loadInitialData

      expect(component.projectId).toBe(100);
      expect(component.currentUserId).toBe('u1');
      expect(component.projectOverseerId).toBe('u1');
      expect(component.tasks).toEqual(mockTasks);
      expect(component.availableUsers).toEqual(mockUsers);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle API errors inside forkJoin gracefully and show toast warning', () => {
      mockProjectService.getProjectById.and.returnValue(
        throwError(() => ({ error: { message: 'Failed to access' } })),
      );

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Failed to access',
        'error',
      );
    });
  });

  describe('Permission Gatekeepers', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should evaluate canCreateTask based on current userId overseer match', () => {
      component.currentUserId = 'u1';
      expect(component.canCreateTask).toBeTrue();

      component.currentUserId = 'u2';
      expect(component.canCreateTask).toBeFalse();
    });

    it('should evaluate canManageTask correctly for assignees or overseers', () => {
      const task = mockTasks[0]; // Overseen by u1, assigned to u1

      component.currentUserId = 'u1';
      expect(component.canManageTask(task)).toBeTrue();

      component.currentUserId = 'u2';
      expect(component.canManageTask(task)).toBeFalse();
    });

    it('should evaluate canManageSubTask correctly', () => {
      const subTask = mockTasks[0].subTasks[0]; // Assigned to u1

      component.currentUserId = 'u1';
      expect(component.canManageSubTask(subTask, mockTasks[0])).toBeTrue();

      component.currentUserId = 'u2';
      expect(component.canManageSubTask(subTask, mockTasks[0])).toBeFalse();
    });
  });

  describe('Calculators & Sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate completed subtask aggregates and average progress percentage', () => {
      const task = mockTasks[0];
      expect(component.getCompletedSubtasks(task)).toBe(0);
      expect(component.calculateProgress(task)).toBe(0);

      // Complete the subtask
      task.subTasks[0].isCompleted = true;
      expect(component.getCompletedSubtasks(task)).toBe(1);
      expect(component.calculateProgress(task)).toBe(100);
    });

    it('should assign progress colors accurately based on progress limits', () => {
      expect(component.getProgressColor(20)).toBe('red');
      expect(component.getProgressColor(50)).toBe('orange');
      expect(component.getProgressColor(90)).toBe('green');
    });

    it('should sort tasks list by due date or task index', () => {
      component.tasks = [
        { id: 2, endDate: '2026-01-20' } as unknown as TaskDetails,
        { id: 1, endDate: '2026-01-05' } as unknown as TaskDetails,
      ];

      component.sortOption = 'dueDate';
      component.sortTasks();
      expect(component.tasks[0].id).toBe(1); // Earliest due date first

      component.sortOption = 'taskNumber';
      component.sortTasks();
      expect(component.tasks[0].id).toBe(1); // Lowest ID first
    });
  });

  describe('Form Inputs & UI Helpers', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should support adding and removing tags case-insensitively', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');

      component.labelInput = ' Testing ';
      component.addLabel(event);

      expect(component.taskLabels).toContain('Testing');
      expect(component.labelInput).toBe('');

      component.removeLabel('Testing');
      expect(component.taskLabels.length).toBe(0);
    });

    it('should resolve full names or fallback emails for user selections', () => {
      expect(component.getUserName('u1')).toBe('Alice Vance');
      expect(component.getUserName('u99')).toBe('Unknown User');
    });
  });

  describe('Creating Tasks & Subtasks', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should block task creation if mandatory parameters are missing', () => {
      component.newTask.title = '';
      component.createTask();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Please fill in all required fields',
        'warning',
      );
      expect(mockTaskService.createTask).not.toHaveBeenCalled();
    });

    it('should successfully call createTask API and reset local states', () => {
      component.newTask = {
        title: 'Fresh Feature',
        description: 'Fresh Feature Description',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        labels: '',
        taskAssignees: [],
      };
      mockTaskService.createTask.and.returnValue(
        of({
          success: true,
          message: '',
          data: { id: 9, title: 'Fresh Feature' } as unknown as TaskDetails,
        }),
      );

      component.createTask();

      expect(mockTaskService.createTask).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Task created successfully',
        'success',
      );
      expect(component.newTask.title).toBe('');
    });
  });

  describe('Subtask integrity status checks', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedTask = mockTasks[0];
    });

    it('should block subtask completion if nested children remain incomplete', () => {
      const parentSubTask = mockTasks[0].subTasks[0]; // ID: 10
      // Mock child subtask
      const childSubTask = {
        id: 20,
        parentSubTaskId: 10,
        isCompleted: false,
      } as unknown as SubTaskDetails;
      mockTasks[0].subTasks.push(childSubTask);

      component.toggleSubTaskStatus(parentSubTask);

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Cannot complete subtask until all children are finished',
        'warning',
      );
      expect(mockTaskService.updateSubTask).not.toHaveBeenCalled();
    });

    it('should successfully toggle subtask isCompleted status on status change', () => {
      const subTask = mockTasks[0].subTasks[0];
      mockTaskService.updateSubTask.and.returnValue(
        of({ success: true, message: '' }),
      );
      mockTaskService.updateTask.and.returnValue(
        of({ success: true, message: '' }),
      );

      component.toggleSubTaskStatus(subTask);

      expect(mockTaskService.updateSubTask).toHaveBeenCalled();
      expect(subTask.isCompleted).toBeTrue();
    });
  });
});
