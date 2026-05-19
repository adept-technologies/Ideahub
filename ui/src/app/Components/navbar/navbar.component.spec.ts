/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../Services/auth/auth.service';
import { MembershipNotificationsService } from '../../Services/membership-notifications.service';
import { NotificationService } from '../../Services/notification.service';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { BehaviorSubject } from 'rxjs';
describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  // Subjects to emit mock states
  let isLoggedInSubject: BehaviorSubject<boolean>;
  let pendingRequestsSubject: BehaviorSubject<number>;
  let unreadCountSubject: BehaviorSubject<number>;

  // Spies for service dependencies
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMembershipService: jasmine.SpyObj<MembershipNotificationsService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    isLoggedInSubject = new BehaviorSubject<boolean>(false);
    pendingRequestsSubject = new BehaviorSubject<number>(0);
    unreadCountSubject = new BehaviorSubject<number>(0);

    mockAuthService = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['login', 'signUp', 'logout'],
      {
        isLoggedIn$: isLoggedInSubject.asObservable(),
      }
    );

    mockMembershipService = jasmine.createSpyObj<MembershipNotificationsService>(
      'MembershipNotificationsService',
      [],
      {
        pendingRequests$: pendingRequestsSubject.asObservable(),
      }
    );

    mockNotificationService = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['fetchUnreadCount'],
      {
        unreadCount$: unreadCountSubject.asObservable(),
      }
    );

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        provideIcons({}),
        { provide: AuthService, useValue: mockAuthService },
        { provide: MembershipNotificationsService, useValue: mockMembershipService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Reactive States & Streams', () => {
    it('should combine unreadCount and pendingRequests to calculate totalBadge$', (done) => {
      fixture.detectChanges();

      // Emit initial mock count
      pendingRequestsSubject.next(3);
      unreadCountSubject.next(2);

      component.totalBadge$.subscribe((total) => {
        expect(total).toBe(5);
        done();
      });
    });

    it('should compute totalBadge$ as 0 if both are 0', (done) => {
      fixture.detectChanges();

      pendingRequestsSubject.next(0);
      unreadCountSubject.next(0);

      component.totalBadge$.subscribe((total) => {
        expect(total).toBe(0);
        done();
      });
    });
  });

  describe('Lifecycle Hooks & Initialization', () => {
    it('should trigger fetchUnreadCount on startup if user is logged in', () => {
      isLoggedInSubject.next(true);
      fixture.detectChanges(); // triggers ngOnInit

      expect(mockNotificationService.fetchUnreadCount).toHaveBeenCalledTimes(1);
    });

    it('should NOT trigger fetchUnreadCount on startup if user is logged out', () => {
      isLoggedInSubject.next(false);
      fixture.detectChanges(); // triggers ngOnInit

      expect(mockNotificationService.fetchUnreadCount).not.toHaveBeenCalled();
    });
  });

  describe('HostListener (Window Focus Focus-sync)', () => {
    it('should fetch unread count on window focus if logged in', () => {
      isLoggedInSubject.next(true);
      fixture.detectChanges(); // triggers ngOnInit and initial calls

      mockNotificationService.fetchUnreadCount.calls.reset();

      // Dispatch window focus event
      window.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(mockNotificationService.fetchUnreadCount).toHaveBeenCalledTimes(1);
    });

    it('should NOT fetch unread count on window focus if logged out', () => {
      isLoggedInSubject.next(false);
      fixture.detectChanges(); // triggers ngOnInit

      mockNotificationService.fetchUnreadCount.calls.reset();

      // Dispatch window focus event
      window.dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      expect(mockNotificationService.fetchUnreadCount).not.toHaveBeenCalled();
    });
  });

  describe('User Actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should forward onLogin request to AuthService', () => {
      component.onLogin();
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should forward onSignUp request to AuthService', () => {
      component.onSignUp();
      expect(mockAuthService.signUp).toHaveBeenCalled();
    });

    it('should forward onLogout request to AuthService', () => {
      component.onLogout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('Mobile Menu Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should start with isMobileMenuOpen as false', () => {
      expect(component.isMobileMenuOpen).toBeFalse();
    });

    it('should toggle the menu state when toggleMobileMenu is called', () => {
      component.toggleMobileMenu();
      expect(component.isMobileMenuOpen).toBeTrue();

      component.toggleMobileMenu();
      expect(component.isMobileMenuOpen).toBeFalse();
    });

    it('should force close the menu when closeMobileMenu is called', () => {
      component.isMobileMenuOpen = true;

      component.closeMobileMenu();
      expect(component.isMobileMenuOpen).toBeFalse();
    });
  });
});
