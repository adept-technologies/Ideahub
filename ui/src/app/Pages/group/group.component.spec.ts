/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GroupsComponent } from './group.component';
import { GroupsService } from '../../Services/groups.service';
import { AuthService } from '../../Services/auth/auth.service';
import { ToastService } from '../../Services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MembershipNotificationsService } from '../../Services/membership-notifications.service';
import { of } from 'rxjs';
import {
  Group,
  JoinGroupResponse,
} from '../../Interfaces/Groups/groups-interfaces';
import { ApiResponse } from '../../Interfaces/Api-Response/api-response';
import { ReactiveFormsModule } from '@angular/forms';

describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  let mockGroupsService: jasmine.SpyObj<GroupsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMembershipNotificationService: jasmine.SpyObj<MembershipNotificationsService>;

  let mockGroups: Group[];

  beforeEach(async () => {
    mockGroups = [
      {
        id: 'g1',
        name: 'Cyber Security Shield',
        description: 'Hardening cloud networks and firewalls.',
        isMember: true,
        hasPendingRequest: false,
        memberCount: 5,
        ideaCount: 3,
        isActive: true,
        isDeleted: false,
        createdAt: '2026-01-01T12:00:00Z',
        createdByUserId: 'user-admin-1',
        createdByUser: { displayName: 'Alice Admin', email: 'alice@test.com' },
        isPublic: 'Public',
      },
      {
        id: 'g2',
        name: 'Quantum Compute Club',
        description: 'Exploring quantum algorithms.',
        isMember: false,
        hasPendingRequest: false,
        memberCount: 2,
        ideaCount: 1,
        isActive: true,
        isDeleted: false,
        createdAt: '2026-01-02T12:00:00Z',
        createdByUserId: 'user-member-1',
        createdByUser: { displayName: 'Bob Member', email: 'bob@test.com' },
        isPublic: 'Private',
      },
    ];

    mockGroupsService = jasmine.createSpyObj('GroupsService', [
      'getGroups',
      'joinGroup',
      'createGroup',
      'getGroupMembers',
      'deleteGroup',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMembershipNotificationService = jasmine.createSpyObj(
      'MembershipNotificationsService',
      ['refreshPendingRequests'],
    );

    // Set default service returns
    mockAuthService.getUserId.and.returnValue(of('user-admin-1'));
    mockGroupsService.getGroups.and.returnValue(
      of({ success: true, message: '', data: mockGroups }),
    );

    await TestBed.configureTestingModule({
      imports: [GroupsComponent, ReactiveFormsModule],
      providers: [
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        {
          provide: MembershipNotificationsService,
          useValue: mockMembershipNotificationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create the groups page component', () => {
    expect(component).toBeTruthy();
  });

  describe('Utility Helper Functions', () => {
    it('should compute two-character initials for groups display avatars', () => {
      expect(component.getInitials('Cyber Security Shield')).toBe('CS');
      expect(component.getInitials('Quantum')).toBe('Q');
      expect(component.getInitials('')).toBe('?');
    });

    it('should format date strings into human-readable structures', () => {
      expect(component.formatDate('2026-01-01T12:00:00Z')).toBe('Jan 1, 2026');
      expect(component.formatDate(undefined)).toBe('Unknown date');
    });

    it('should format member count labels correctly', () => {
      expect(component.formatMemberCount(0)).toBe('0 members');
      expect(component.formatMemberCount(1)).toBe('1 member');
      expect(component.formatMemberCount(12)).toBe('12 members');
    });
  });

  describe('Groups Loading', () => {
    it('should load groups list and assign mapping properties', () => {
      expect(mockGroupsService.getGroups).toHaveBeenCalled();
      expect(component.groups.length).toBe(2);
      expect(component.groups[0].name).toBe('Quantum Compute Club'); // Ordered by date descending
    });
  });

  describe('Modal Visibility Management', () => {
    it('should open and close details modal', () => {
      const targetGroup = mockGroups[0];
      component.openDetailsModal(targetGroup);

      expect(component.selectedGroup).toBe(targetGroup);
      expect(component.showDetailsModal).toBeTrue();

      component.closeDetailsModal();
      expect(component.selectedGroup).toBeNull();
      expect(component.showDetailsModal).toBeFalse();
    });

    it('should open and close create group modal', () => {
      component.openCreateModal();
      expect(component.showCreateModal).toBeTrue();

      component.closeCreateModal();
      expect(component.showCreateModal).toBeFalse();
    });
  });

  describe('View and Navigate Ideas', () => {
    it('should warn and exit if trying to view ideas of a non-member group', () => {
      const nonMemberGroup = mockGroups[1]; // Quantum Compute Club (isMember: false)
      component.onViewIdeas(nonMemberGroup.id);

      expect(mockToastService.show).toHaveBeenCalledWith(
        'You must be a member of this group to view ideas.',
        'info',
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should successfully navigate to ideas route with active state parameters if member', () => {
      const memberGroup = mockGroups[0]; // Cyber Security Shield (isMember: true)
      component.onViewIdeas(memberGroup.id);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/groups', 'g1', 'ideas'],
        {
          state: {
            isGroupCreator: true,
            groupName: 'Cyber Security Shield',
            groupCreatorId: 'user-admin-1',
          },
        },
      );
    });
  });

  describe('Group Join Actions', () => {
    it('should reject join triggers immediately if already a member', () => {
      const memberGroup = mockGroups[0];
      component.onJoinGroup(memberGroup.id);

      expect(mockToastService.show).toHaveBeenCalledWith(
        'You are already a member of this group!',
        'info',
      );
      expect(mockGroupsService.joinGroup).not.toHaveBeenCalled();
    });

    it('should successfully send a join request to private group and mark it as pending', () => {
      const targetGroup = mockGroups[1]; // Quantum Compute Club (isMember: false, Private)
      const joinResponse: ApiResponse<JoinGroupResponse> = {
        success: true,
        message: 'Request sent',
        data: { isPublic: false },
      };
      mockGroupsService.joinGroup.and.returnValue(of(joinResponse));

      // Simulate a real backend by returning the updated pending request on reload
      const updatedGroupsList = mockGroups.map((g) =>
        g.id === targetGroup.id ? { ...g, hasPendingRequest: true } : g,
      );
      mockGroupsService.getGroups.and.returnValue(
        of({ success: true, message: '', data: updatedGroupsList }),
      );

      component.onJoinGroup(targetGroup.id);

      expect(mockGroupsService.joinGroup).toHaveBeenCalledWith('g2');
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Request sent! Waiting for admin approval.',
        'success',
      );

      const updatedGroup = component.groups.find(
        (g) => g.id === targetGroup.id,
      );
      expect(updatedGroup?.hasPendingRequest).toBeTrue();
    });

    it('should join immediately if group is public', () => {
      const targetGroup = mockGroups[1];
      const joinResponse: ApiResponse<JoinGroupResponse> = {
        success: true,
        message: 'Joined successfully',
        data: { isPublic: true },
      };
      mockGroupsService.joinGroup.and.returnValue(of(joinResponse));
      spyOn(component, 'onViewIdeas');

      component.onJoinGroup(targetGroup.id);

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Joined successfully',
        'success',
      );

      const updatedGroup = component.groups.find(
        (g) => g.id === targetGroup.id,
      );
      expect(updatedGroup?.isMember).toBeTrue();
      expect(component.onViewIdeas).toHaveBeenCalledWith('g2');
    });
  });

  describe('Group Creation Form', () => {
    it('should validate form constraints and flag invalid controls', () => {
      component.createGroupForm.get('name')?.setValue('A'); // Too short (min 3)
      component.createGroupForm.get('description')?.setValue('short'); // Too short (min 10)

      expect(component.createGroupForm.valid).toBeFalse();
    });

    it('should submit valid new group and trigger list reload', () => {
      component.createGroupForm.patchValue({
        name: 'New Innovation Lab',
        description: 'Fostering research workflows and automation tools.',
        isPublic: true,
      });

      const addResponse: ApiResponse<Group> = {
        success: true,
        message: 'Created',
        data: mockGroups[0],
      };
      mockGroupsService.createGroup.and.returnValue(of(addResponse));

      component.onCreateGroup();

      expect(mockGroupsService.createGroup).toHaveBeenCalledWith({
        name: 'New Innovation Lab',
        description: 'Fostering research workflows and automation tools.',
        isPublic: true,
      });
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Group created successfully!',
        'success',
      );
      expect(component.showCreateModal).toBeFalse();
    });
  });

  describe('Group Deletion Security', () => {
    it('should validate delete confirmation input matching exact group name', () => {
      const targetGroup = mockGroups[0];
      component.openDeleteModal(targetGroup);

      component.deleteConfirmControl.setValue('Incorrect Name');
      expect(component.deleteConfirmControl.valid).toBeFalse();

      component.deleteConfirmControl.setValue('cyber security shield'); // Matches case-insensitively
      expect(component.deleteConfirmControl.valid).toBeTrue();
    });

    it('should call API to delete group when validation passes', () => {
      const targetGroup = mockGroups[0];
      component.openDeleteModal(targetGroup);
      component.deleteConfirmControl.setValue('Cyber Security Shield');

      mockGroupsService.deleteGroup.and.returnValue(
        of({ success: true, message: 'Deleted' }),
      );

      component.deleteGroup(targetGroup.id);

      expect(mockGroupsService.deleteGroup).toHaveBeenCalledWith('g1');
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Group deleted successfully!',
        'success',
      );
      expect(component.showDeleteModal).toBeFalse();
    });
  });
});
