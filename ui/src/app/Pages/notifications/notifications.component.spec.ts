/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { GroupsService } from '../../Services/groups.service';
import { GroupMembershipRequest } from '../../Interfaces/Groups/groups-interfaces';
import { of, throwError } from 'rxjs';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let mockGroupsService: jasmine.SpyObj<GroupsService>;
  let mockRequests: GroupMembershipRequest[];

  beforeEach(async () => {
    mockRequests = [
      {
        id: 10,
        userId: 'u1',
        groupId: 'g1',
        status: 'Pending',
        requestedAt: '2026-01-01',
        userName: 'User One',
      },
      {
        id: 11,
        userId: 'u2',
        groupId: 'g1',
        status: 'Pending',
        requestedAt: '2026-01-01',
        userName: 'User Two',
      },
    ];

    mockGroupsService = jasmine.createSpyObj('GroupsService', [
      'viewRequests',
      'acceptRequest',
      'rejectRequest',
    ]);

    mockGroupsService.viewRequests.and.returnValue(
      of({ success: true, message: '', data: mockRequests }),
    );
    mockGroupsService.acceptRequest.and.returnValue(
      of({ success: true, message: '' }),
    );
    mockGroupsService.rejectRequest.and.returnValue(
      of({ success: true, message: '' }),
    );

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [{ provide: GroupsService, useValue: mockGroupsService }],
    })
      .overrideComponent(NotificationsComponent, {
        set: {
          template: '<div>Notifications Template Override</div>',
          styles: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the notifications component', () => {
    expect(component).toBeTruthy();
  });

  describe('Loading Requests', () => {
    it('should query viewRequests and populate list on loadRequests call', () => {
      component.loadRequests('g1');

      expect(component.loading).toBeFalse();
      expect(mockGroupsService.viewRequests).toHaveBeenCalledWith('g1');
      expect(component.requests).toEqual(mockRequests);
      expect(component.errorMessage).toBe('');
    });

    it('should assign error message when request loading fails', () => {
      mockGroupsService.viewRequests.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      component.loadRequests('g1');

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('Could not load requests');
      expect(component.requests.length).toBe(0);
    });
  });

  describe('Processing Requests', () => {
    beforeEach(() => {
      component.requests = [...mockRequests];
    });

    it('should accept request and filter out the user from the local UI array instantly', () => {
      component.acceptRequest('g1', 'u1');

      expect(mockGroupsService.acceptRequest).toHaveBeenCalledWith('g1', 'u1');
      expect(component.requests.length).toBe(1);
      expect(component.requests[0].userId).toBe('u2');
    });

    it('should display browser alert when acceptRequest service fails', () => {
      spyOn(window, 'alert');
      mockGroupsService.acceptRequest.and.returnValue(
        throwError(() => new Error('API Failure')),
      );

      component.acceptRequest('g1', 'u1');

      expect(window.alert).toHaveBeenCalledWith('Failed to accept request');
      expect(component.requests.length).toBe(2); // UI unchanged
    });

    it('should reject request and filter out the user from the local UI array instantly', () => {
      component.rejectRequest('g1', 'u2');

      expect(mockGroupsService.rejectRequest).toHaveBeenCalledWith('g1', 'u2');
      expect(component.requests.length).toBe(1);
      expect(component.requests[0].userId).toBe('u1');
    });

    it('should display browser alert when rejectRequest service fails', () => {
      spyOn(window, 'alert');
      mockGroupsService.rejectRequest.and.returnValue(
        throwError(() => new Error('API Failure')),
      );

      component.rejectRequest('g1', 'u2');

      expect(window.alert).toHaveBeenCalledWith('Failed to reject request');
      expect(component.requests.length).toBe(2); // UI unchanged
    });
  });
});
