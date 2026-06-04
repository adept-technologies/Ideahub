/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TasksComponent } from './tasks.component';
import { TaskService } from '../../Services/task.service';
import {
  ActivatedRoute,
  provideRouter,
  convertToParamMap,
} from '@angular/router';
import { TaskDetails } from '../../Interfaces/Tasks/task-interface';
import { of, throwError } from 'rxjs';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockTasks: TaskDetails[];
  let mockActivatedRoute: unknown;

  beforeEach(async () => {
    mockTasks = [
      {
        id: 1,
        title: 'Task One',
        description: 'Desc One',
        isCompleted: false,
        endDate: '2026-01-01',
        subTasks: [],
      } as unknown as TaskDetails,
      {
        id: 2,
        title: 'Task Two',
        description: 'Desc Two',
        isCompleted: true,
        endDate: '2026-01-02',
        subTasks: [],
      } as unknown as TaskDetails,
    ];

    mockTaskService = jasmine.createSpyObj('TaskService', ['getProjectTasks']);
    mockTaskService.getProjectTasks.and.returnValue(
      of({ success: true, message: '', data: mockTasks }),
    );

    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ projectId: '123' }),
      },
    };

    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: mockTaskService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
  });

  it('should create the tasks component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should extract projectId from snapshot paramMap and load tasks', () => {
      fixture.detectChanges(); // Triggers ngOnInit

      expect(component.projectId).toBe(123);
      expect(mockTaskService.getProjectTasks).toHaveBeenCalledWith(123);
      expect(component.tasks).toEqual(mockTasks);
      expect(component.accessDenied).toBeFalse();
      expect(component.isLoading).toBeFalse();
    });

    it('should set accessDenied true if API returns success=false', () => {
      mockTaskService.getProjectTasks.and.returnValue(
        of({ success: false, message: 'Denied' }),
      );

      fixture.detectChanges();

      expect(component.accessDenied).toBeTrue();
      expect(component.tasks.length).toBe(0);
    });

    it('should set accessDenied true on 403 HTTP response error', () => {
      mockTaskService.getProjectTasks.and.returnValue(
        throwError(() => ({ status: 403, message: 'Forbidden' })),
      );

      fixture.detectChanges();

      expect(component.accessDenied).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
  });
});
