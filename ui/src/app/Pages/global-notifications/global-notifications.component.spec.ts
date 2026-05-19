/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GlobalNotificationsComponent } from './global-notifications.component';
import { GroupsService } from '../../Services/groups.service';
import { ToastService } from '../../Services/toast.service';
import { MembershipNotificationsService } from '../../Services/membership-notifications.service';
import {
  NotificationService,
  CommentNotification,
} from '../../Services/notification.service';
import { SignalrService } from '../../Services/signalr.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { GroupMembershipRequest } from '../../Interfaces/Groups/groups-interfaces';

describe('GlobalNotificationsComponent', () => {
  let component: GlobalNotificationsComponent;
  let fixture: ComponentFixture<GlobalNotificationsComponent>;

  let mockGroupsService: jasmine.SpyObj<GroupsService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockMembershipNotificationService: jasmine.SpyObj<MembershipNotificationsService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockSignalrService: { notificationSubject: BehaviorSubject<unknown> };
  let mockRouter: jasmine.SpyObj<Router>;

  let mockRequests: GroupMembershipRequest[];
  let mockComments: CommentNotification[];

  beforeEach(async () => {
    mockRequests = [
      {
        id: 10,
        userId: 'u1',
        groupId: '1',
        status: 'Pending',
        requestedAt: '2026-01-01T12:00:00Z',
        groupName: 'Tech Team',
        userEmail: 'user1@test.com',
        userName: 'User One',
      },
      {
        id: 11,
        userId: 'u2',
        groupId: '1',
        status: 'Pending',
        requestedAt: '2026-01-01T12:00:00Z',
        groupName: 'Tech Team',
        userEmail: 'user2@test.com',
        userName: 'User Two',
      },
      {
        id: 12,
        userId: 'u3',
        groupId: '2',
        status: 'Pending',
        requestedAt: '2026-01-01T12:00:00Z',
        groupName: 'HR Group',
        userEmail: 'user3@test.com',
        userName: 'User Three',
      },
    ];

    mockComments = [
      {
        id: 101,
        isRead: false,
        comment: {
          id: 1001,
          ideaId: 50,
          content: 'Excellent idea!',
          groupId: '1',
        },
      } as unknown as CommentNotification,
      {
        id: 102,
        isRead: true,
        comment: {
          id: 1002,
          ideaId: 51,
          content: 'Nice concept.',
          groupId: '2',
        },
      } as unknown as CommentNotification,
    ];

    mockGroupsService = jasmine.createSpyObj('GroupsService', [
      'viewGlobalRequests',
      'acceptRequest',
      'rejectRequest',
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockMembershipNotificationService = jasmine.createSpyObj(
      'MembershipNotificationsService',
      ['decrement', 'increment', 'set'],
    );
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'getNotifications',
      'markAsRead',
      'markAllAsRead',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockSignalrService = {
      notificationSubject: new BehaviorSubject<unknown>(null),
    };

    // Default mocks
    mockGroupsService.viewGlobalRequests.and.returnValue(
      of({ success: true, message: '', data: mockRequests }),
    );
    mockGroupsService.acceptRequest.and.returnValue(
      of({ success: true, message: '' }),
    );
    mockGroupsService.rejectRequest.and.returnValue(
      of({ success: true, message: '' }),
    );

    mockNotificationService.getNotifications.and.returnValue(
      of({ success: true, message: '', data: mockComments }),
    );
    mockNotificationService.markAsRead.and.returnValue(
      of({ success: true, message: '' }),
    );
    mockNotificationService.markAllAsRead.and.returnValue(
      of({ success: true, message: '' }),
    );

    await TestBed.configureTestingModule({
      imports: [GlobalNotificationsComponent],
      providers: [
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: ToastService, useValue: mockToastService },
        {
          provide: MembershipNotificationsService,
          useValue: mockMembershipNotificationService,
        },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: SignalrService, useValue: mockSignalrService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create the global notifications component', () => {
    expect(component).toBeTruthy();
  });

  describe('Tab Management', () => {
    it('should initialize activeTab as requests', () => {
      expect(component.activeTab).toBe('requests');
    });

    it('should toggle activeTab correctly when setTab is called', () => {
      component.setTab('comments');
      expect(component.activeTab).toBe('comments');

      component.setTab('requests');
      expect(component.activeTab).toBe('requests');
    });
  });

  describe('Group Membership Requests Management', () => {
    it('should load global requests and group them by Group ID', () => {
      expect(mockGroupsService.viewGlobalRequests).toHaveBeenCalled();
      expect(component.groupedRequests.length).toBe(2); // Group 1 (Tech Team) and Group 2 (HR Group)

      const group1 = component.groupedRequests.find((g) => g.groupId === '1');
      expect(group1).toBeTruthy();
      expect(group1?.groupName).toBe('Tech Team');
      expect(group1?.requests.length).toBe(2);
    });

    it('should calculate the total pending requests sum correctly', () => {
      expect(component.totalRequests).toBe(3);
    });

    it('should toggle group accordion open state', () => {
      const group = { open: false };
      component.toggleGroup(group);
      expect(group.open).toBeTrue();

      component.toggleGroup(group);
      expect(group.open).toBeFalse();
    });

    it('should accept a membership request and decrement notification badges', () => {
      const targetReq = mockRequests[0];
      component.acceptRequest(targetReq);

      expect(mockGroupsService.acceptRequest).toHaveBeenCalledWith(
        '1',
        'user1@test.com',
      );
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Request accepted',
        'success',
      );
      expect(mockMembershipNotificationService.decrement).toHaveBeenCalledWith(
        1,
      );
    });

    it('should reject a membership request and decrement notification badges', () => {
      const targetReq = mockRequests[0];
      component.rejectRequest(targetReq);

      expect(mockGroupsService.rejectRequest).toHaveBeenCalledWith(
        '1',
        'user1@test.com',
      );
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Request rejected',
        'success',
      );
      expect(mockMembershipNotificationService.decrement).toHaveBeenCalledWith(
        1,
      );
    });

    it('should accept all pending requests for a group in a bulk loop', () => {
      const group = component.groupedRequests[0]; // Tech Team, has 2 requests
      component.acceptAll(group);

      expect(mockGroupsService.acceptRequest).toHaveBeenCalledTimes(2);
      expect(mockToastService.show).toHaveBeenCalledWith(
        'All requests accepted',
        'success',
      );
    });

    it('should reject all pending requests for a group in a bulk loop', () => {
      const group = component.groupedRequests[0]; // Tech Team, has 2 requests
      component.rejectAll(group);

      expect(mockGroupsService.rejectRequest).toHaveBeenCalledTimes(2);
      expect(mockToastService.show).toHaveBeenCalledWith(
        'All requests rejected',
        'success',
      );
    });
  });

  describe('Comment Notifications Management', () => {
    it('should query and load all comment notifications on load', () => {
      expect(mockNotificationService.getNotifications).toHaveBeenCalled();
      expect(component.commentNotifications).toEqual(mockComments);
    });

    it('should compute unread notifications count correctly', () => {
      expect(component.unreadCount).toBe(1); // 1 read, 1 unread
    });

    it('should mark a single notification as read', () => {
      const targetNotification = mockComments[0]; // unread
      component.markAsRead(targetNotification);

      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(101);
      expect(targetNotification.isRead).toBeTrue();
    });

    it('should not query API if the notification is already read', () => {
      const targetNotification = mockComments[1]; // read
      component.markAsRead(targetNotification);

      expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
    });

    it('should mark all notifications as read and show success feedback', () => {
      component.markAllAsRead();

      expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
      expect(component.commentNotifications.every((n) => n.isRead)).toBeTrue();
      expect(mockToastService.show).toHaveBeenCalledWith(
        'All notifications marked as read',
        'success',
      );
    });

    it('should navigate to group page with correct state and query params on click', () => {
      const targetNotification = mockComments[0];
      component.onNotificationClick(targetNotification);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/groups', '1', 'ideas'],
        {
          queryParams: { ideaId: 50, commentId: 1001 },
        },
      );
      // Should also trigger markAsRead automatically
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(101);
    });
  });

  describe('Real-Time SignalR Integration', () => {
    it('should re-query notifications whenever SignalR emits a new message', () => {
      mockNotificationService.getNotifications.calls.reset();

      // Emit new notification message
      mockSignalrService.notificationSubject.next({ message: 'New comment' });

      expect(mockNotificationService.getNotifications).toHaveBeenCalled();
    });
  });
});
