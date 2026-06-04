/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';
import { ProjectService } from '../../Services/project.service';
import { MediaService } from '../../Services/media.service';
import { TaskService } from '../../Services/task.service';
import { AuthService } from '../../Services/auth/auth.service';
import { ToastService } from '../../Services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ProjectStatus,
  Project,
} from '../../Interfaces/Projects/project-interface';
import { BehaviorSubject, of, throwError } from 'rxjs';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockMediaService: jasmine.SpyObj<MediaService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRouter: jasmine.SpyObj<Router>;

  let queryParamsSubject: BehaviorSubject<unknown>;
  let mockProjects: Project[];

  beforeEach(async () => {
    // Generate dates relative to current local time for accurate due week tests
    const now = new Date();
    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(now.getDate() + 2);

    mockProjects = [
      {
        id: 101,
        title: 'Cloud Firewall Migration',
        description: 'Migrating legacy edge firewalls to cloud proxy clusters.',
        status: ProjectStatus.Active,
        createdAt: '2026-01-01T12:00:00Z',
        endedAt: twoDaysLater.toISOString(), // Within current week
        overseenBy: 'Alice Vance',
        overseenById: 'u1',
        progress: 60,
      },
      {
        id: 102,
        title: 'Zero Trust Authentication',
        description: 'Implementing token validation and secure claims.',
        status: ProjectStatus.Planning,
        createdAt: '2026-01-02T12:00:00Z',
        overseenBy: 'Bob Member',
        overseenById: 'u2',
        progress: 20,
      },
    ];

    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getMyProjects',
      'updateProject',
      'deleteProject',
    ]);
    mockMediaService = jasmine.createSpyObj('MediaService', [
      'viewMedia',
      'uploadMedia',
    ]);
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTasks']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    queryParamsSubject = new BehaviorSubject<unknown>({});

    mockAuthService.getUserId.and.returnValue(of('u1'));
    mockProjectService.getMyProjects.and.returnValue(of(mockProjects));
    mockProjectService.updateProject.and.returnValue(
      of({ success: true, message: '', data: mockProjects[0] }),
    );
    mockProjectService.deleteProject.and.returnValue(
      of({ success: true, message: 'Deleted' }),
    );
    mockMediaService.viewMedia.and.returnValue(
      of({ success: true, message: '', data: [] }),
    );
    mockMediaService.uploadMedia.and.returnValue(
      of({ success: true, message: '' }),
    );

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: MediaService, useValue: mockMediaService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParamsSubject.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create the projects component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization and ForkJoin Media Loading', () => {
    it('should load projects, trigger parallel media queries, and populate results', () => {
      fixture.detectChanges(); // Triggers ngOnInit -> loadProjects

      expect(mockAuthService.getUserId).toHaveBeenCalled();
      expect(component.currentUserId).toBe('u1');
      expect(mockProjectService.getMyProjects).toHaveBeenCalled();
      expect(mockMediaService.viewMedia).toHaveBeenCalledTimes(2); // Called for id 101 and 102
      expect(component.projects.length).toBe(2);
      expect(component.projects[0].media).toBeDefined();
    });

    it('should open edit modal on startup if query parameter openProject points to an owned project', () => {
      queryParamsSubject.next({ openProject: '101' });
      fixture.detectChanges(); // ngOnInit

      expect(component.selectedProject?.id).toBe(101);
      expect(component.isEditModalOpen).toBeTrue();
    });

    it('should open view modal on startup if query parameter openProject points to a non-owned project', () => {
      queryParamsSubject.next({ openProject: '102' }); // Owned by u2 (current is u1)
      fixture.detectChanges();

      expect(component.selectedProject?.id).toBe(102);
      expect(component.isViewModalOpen).toBeTrue();
    });
  });

  describe('Component Getters & Analytics Metrics', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate activeProjectsCount correctly', () => {
      expect(component.activeProjectsCount).toBe(1); // 1 Active, 1 Planning
    });

    it('should calculate dueThisWeekCount correctly based on current local dates', () => {
      expect(component.dueThisWeekCount).toBe(1);
    });

    it('should compute overallAverageProgress mathematically', () => {
      expect(component.overallAverageProgress).toBe(40); // (60 + 20) / 2
    });

    it('should return 0 average progress if no projects are listed', () => {
      component.projects = [];
      expect(component.overallAverageProgress).toBe(0);
    });

    it('should search and filter projects list case-insensitively by title or overseer', () => {
      component.searchTerm = 'Firewall';
      expect(component.filteredProjects.length).toBe(1);
      expect(component.filteredProjects[0].id).toBe(101);

      component.searchTerm = 'alice';
      expect(component.filteredProjects.length).toBe(1);
      expect(component.filteredProjects[0].id).toBe(101);

      component.searchTerm = 'Non-existent';
      expect(component.filteredProjects.length).toBe(0);
    });
  });

  describe('Menu & UI Toggle Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle action menu correctly and close other popups', () => {
      const mockEvent = new MouseEvent('click');
      spyOn(mockEvent, 'stopPropagation');

      component.toggleActionMenu(mockEvent, 101);
      expect(component.activeActionMenuId).toBe(101);
      expect(component.activeMediaProjectId).toBeNull();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      component.toggleActionMenu(mockEvent, 101);
      expect(component.activeActionMenuId).toBeNull();
    });

    it('should toggle media popup correctly and close other menus', () => {
      const mockEvent = new MouseEvent('click');
      spyOn(mockEvent, 'stopPropagation');

      component.toggleMediaPopup(mockEvent, 102);
      expect(component.activeMediaProjectId).toBe(102);
      expect(component.activeActionMenuId).toBeNull();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should close all menus on host document click', () => {
      component.activeActionMenuId = 101;
      component.activeMediaProjectId = 102;

      component.closeMenus();

      expect(component.activeActionMenuId).toBeNull();
      expect(component.activeMediaProjectId).toBeNull();
    });
  });

  describe('Editing & Saving Projects', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.openEditModal(mockProjects[0]); // Cloud Firewall Migration (id: 101)
    });

    it('should verify editing permissions strictly using OverseerId match', () => {
      expect(component.canEdit(mockProjects[0])).toBeTrue(); // u1 matches overseerId
      expect(component.canEdit(mockProjects[1])).toBeFalse(); // u2 does not match
    });

    it('should block updates and show warning toast when title or description is missing', () => {
      component.editForm.title = '';
      component.saveProject();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Title and Description are mandatory',
        'warning',
      );
      expect(mockProjectService.updateProject).not.toHaveBeenCalled();
    });

    it('should save project successfully without media uploads', async () => {
      component.editForm.title = 'Updated Title';
      component.editForm.description = 'Updated Desc';
      component.editForm.status = 'Completed';
      component.editForm.endedAt = null;

      await component.saveProject();

      expect(mockProjectService.updateProject).toHaveBeenCalledWith(101, {
        title: 'Updated Title',
        description: 'Updated Desc',
        status: 'Completed',
        endedAt: null,
      });
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Project updated successfully',
        'success',
      );
      expect(component.isEditModalOpen).toBeFalse();
    });

    it('should save project and upload all newly selected media files', async () => {
      const mockFile1 = new File(['data'], 'firewall_spec.pdf', {
        type: 'application/pdf',
      });
      const mockFile2 = new File(['data'], 'diagram.png', {
        type: 'image/png',
      });
      component.selectedProjectFiles = [mockFile1, mockFile2];

      await component.saveProject();

      expect(mockProjectService.updateProject).toHaveBeenCalled();
      expect(mockMediaService.uploadMedia).toHaveBeenCalledTimes(2);
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Project updated with media successfully',
        'success',
      );
    });

    it('should notify user of partial failure if project updates but media upload fails', async () => {
      const mockFile = new File(['data'], 'error.pdf', {
        type: 'application/pdf',
      });
      component.selectedProjectFiles = [mockFile];
      mockMediaService.uploadMedia.and.returnValue(
        throwError(() => new Error('Upload Failed')),
      );

      await component.saveProject();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Project updated, but media upload failed. Please try again.',
        'error',
      );
    });
  });

  describe('Project Deletion & Safe Confirmations', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.openDeleteModal(mockProjects[0]);
    });

    it('should open delete confirmation modal with cleared status variables', () => {
      expect(component.projectToDelete?.id).toBe(101);
      expect(component.deleteConfirmName).toBe('');
      expect(component.isDeleteModalOpen).toBeTrue();
    });

    it('should validate matches and return false unless typed confirmation string matches title exactly', () => {
      component.deleteConfirmName = 'Incorrect Name';
      expect(component.isDeleteNameMatch).toBeFalse();

      component.deleteConfirmName = 'Cloud Firewall Migration';
      expect(component.isDeleteNameMatch).toBeTrue();
    });

    it('should reject deletion triggers if validation is failing', () => {
      component.deleteConfirmName = 'Incorrect Name';
      component.confirmDelete();

      expect(mockProjectService.deleteProject).not.toHaveBeenCalled();
    });

    it('should call API to delete project when name matches perfectly and refresh layout', () => {
      component.deleteConfirmName = 'Cloud Firewall Migration';
      component.confirmDelete();

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(101);
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Project deleted successfully',
        'success',
      );
      expect(component.isDeleteModalOpen).toBeFalse();
    });
  });

  describe('Router Tasks Navigation', () => {
    it('should navigate to subtask page and clear action menus on trigger', () => {
      component.navigateToTasks(101);

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/projects',
        101,
        'tasks',
      ]);
      expect(component.activeActionMenuId).toBeNull();
    });
  });
});
