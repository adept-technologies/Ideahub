/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommitteeMembersComponent } from './committeemembers.component';
import { CommitteeMembersService } from '../../Services/committeemembers.service';
import { AuthService } from '../../Services/auth/auth.service';
import { ToastService } from '../../Services/toast.service';
import { of, throwError } from 'rxjs';
import { UserRecord } from '../../Interfaces/Users/user-interface';
import { ApiResponse } from '../../Interfaces/Api-Response/api-response';

import { FormsModule } from '@angular/forms';

describe('CommitteeMembersComponent', () => {
  let component: CommitteeMembersComponent;
  let fixture: ComponentFixture<CommitteeMembersComponent>;
  let mockCommitteeService: jasmine.SpyObj<CommitteeMembersService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  let mockMembers: UserRecord[];
  let mockUsers: UserRecord[];

  beforeEach(async () => {
    mockMembers = [
      {
        id: 'u1',
        email: 'alice@company.com',
        fullName: 'Alice Vance',
        displayName: 'Alice Vance',
        roles: ['Admin'],
      },
      {
        id: 'u2',
        email: 'bob@company.com',
        fullName: 'Bob Vance',
        displayName: 'Bob Vance',
        roles: ['Admin'],
      },
    ];

    mockUsers = [
      ...mockMembers,
      {
        id: 'u3',
        email: 'charlie@company.com',
        fullName: 'Charlie Cox',
        displayName: 'Charlie Cox',
        roles: ['User'],
      },
    ];

    mockCommitteeService = jasmine.createSpyObj('CommitteeMembersService', [
      'getCommitteeMembers',
      'getAllUsers',
      'addCommitteeMember',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'isSuperAdmin',
      'isCommitteeMember',
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);

    // Set up default service responses
    mockAuthService.isSuperAdmin.and.returnValue(of(true));
    mockAuthService.isCommitteeMember.and.returnValue(of(true));

    const membersResponse: ApiResponse<UserRecord[]> = {
      success: true,
      message: '',
      data: mockMembers,
    };
    mockCommitteeService.getCommitteeMembers.and.returnValue(
      of(membersResponse),
    );

    const usersResponse: ApiResponse<UserRecord[]> = {
      success: true,
      message: '',
      data: mockUsers,
    };
    mockCommitteeService.getAllUsers.and.returnValue(of(usersResponse));

    await TestBed.configureTestingModule({
      imports: [CommitteeMembersComponent, FormsModule],
      providers: [
        { provide: CommitteeMembersService, useValue: mockCommitteeService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommitteeMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create the committee members component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Security Role Checks', () => {
    it('should query AuthService and correctly assign user security roles', () => {
      expect(mockAuthService.isSuperAdmin).toHaveBeenCalled();
      expect(mockAuthService.isCommitteeMember).toHaveBeenCalled();
      expect(component.isSuperAdmin).toBeTrue();
      expect(component.isCommitteeMember).toBeTrue();
    });

    it('should query and load all committee members on startup', () => {
      expect(mockCommitteeService.getCommitteeMembers).toHaveBeenCalled();
      expect(component.committeeMembers).toEqual(mockMembers);
    });

    it('should query and load the complete list of users on startup', () => {
      expect(mockCommitteeService.getAllUsers).toHaveBeenCalled();
      expect(component.allUsers).toEqual(mockUsers);
    });

    it('should display error toast when loading committee members fails', () => {
      mockCommitteeService.getCommitteeMembers.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      component.loadCommitteeMembers();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Failed to load committee members',
        'error',
      );
    });

    it('should display error toast when loading all users fails', () => {
      mockCommitteeService.getAllUsers.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      component.loadAllUsers();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Failed to load users',
        'error',
      );
    });
  });

  describe('Adding Committee Members', () => {
    it('should warn and exit if no user email is selected', () => {
      component.selectedUserEmail = '';
      component.addMember();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Please select a user email',
        'warning',
      );
      expect(mockCommitteeService.addCommitteeMember).not.toHaveBeenCalled();
    });

    it('should add a committee member successfully and trigger a refresh', () => {
      component.selectedUserEmail = 'charlie@company.com';
      const successResponse: ApiResponse<void> = {
        success: true,
        message: 'Added successfully',
      };
      mockCommitteeService.addCommitteeMember.and.returnValue(
        of(successResponse),
      );

      // Reset mock counters to verify fresh load call
      mockCommitteeService.getCommitteeMembers.calls.reset();

      component.addMember();

      expect(mockCommitteeService.addCommitteeMember).toHaveBeenCalledWith(
        'charlie@company.com',
      );
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Committee member added successfully',
        'success',
      );
      expect(mockCommitteeService.getCommitteeMembers).toHaveBeenCalled();
      expect(component.selectedUserEmail).toBe('');
    });

    it('should display custom API failure error message if add member API reports failure', () => {
      component.selectedUserEmail = 'charlie@company.com';
      const failResponse: ApiResponse<void> = {
        success: false,
        message: 'User is already a member',
      };
      mockCommitteeService.addCommitteeMember.and.returnValue(of(failResponse));

      component.addMember();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'User is already a member',
        'error',
      );
    });

    it('should display default error toast if add member API call errors out', () => {
      component.selectedUserEmail = 'charlie@company.com';
      mockCommitteeService.addCommitteeMember.and.returnValue(
        throwError(() => new Error('Network error')),
      );

      component.addMember();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Failed to add committee member',
        'error',
      );
    });
  });
});
