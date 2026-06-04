/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AnalyticsService } from '../../Services/analytics.service';
import { ProjectService } from '../../Services/project.service';
import { ToastService } from '../../Services/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { provideIcons } from '@ng-icons/core';
import {
  MostVotedIdea,
  TopContributor,
  PromotedIdea,
  IdeaStats,
  GroupEngagement,
  PersonalStats,
} from '../../Models/analytics.models';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let mockAnalyticsService: jasmine.SpyObj<AnalyticsService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRouter: jasmine.SpyObj<Router>;

  let mockMostVoted: MostVotedIdea[];
  let mockContributors: TopContributor[];
  let mockPromoted: PromotedIdea[];
  let mockStats: IdeaStats;
  let mockEngagement: GroupEngagement[];
  let mockPersonal: PersonalStats;

  beforeEach(async () => {
    mockMostVoted = [
      {
        id: 1,
        title: 'Network Encryption',
        proposedSolution: 'use ssl',
        author: 'Alice',
        groupName: 'IT Security',
        voteCount: 15,
        groupId: 10,
        isMember: true,
      },
    ];
    mockContributors = [
      { displayName: 'Alice Vance', email: 'alice@test.com', ideaCount: 4 },
    ];
    mockPromoted = [
      {
        id: 201,
        title: 'AI Assistant',
        proposedSolution: 'Build chatbot',
        author: 'Alice',
        groupName: 'IT Security',
        promotedDate: '2026-01-01',
        projectId: 301,
        groupId: 10,
      },
    ];
    mockStats = { total: 25, open: 10, promoted: 5, closed: 10 };
    mockEngagement = [
      {
        id: 10,
        name: 'IT Security',
        ideaCount: 5,
        voteCount: 12,
        isMember: false,
      },
    ];
    mockPersonal = {
      ideasCreated: 3,
      votesCast: 5,
      projectsInvolved: 2,
      groupsCreated: 1,
    };

    mockAnalyticsService = jasmine.createSpyObj('AnalyticsService', [
      'getMostVotedIdeas',
      'getTopContributors',
      'getPromotedIdeas',
      'getIdeaStatistics',
      'getGroupEngagement',
      'getPersonalStats',
    ]);
    mockProjectService = jasmine.createSpyObj('ProjectService', ['getProject']);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Map default analytics forks
    mockAnalyticsService.getMostVotedIdeas.and.returnValue(
      of({ success: true, message: '', data: mockMostVoted }),
    );
    mockAnalyticsService.getTopContributors.and.returnValue(
      of({ success: true, message: '', data: mockContributors }),
    );
    mockAnalyticsService.getPromotedIdeas.and.returnValue(
      of({ success: true, message: '', data: mockPromoted }),
    );
    mockAnalyticsService.getIdeaStatistics.and.returnValue(
      of({ success: true, message: '', data: mockStats }),
    );
    mockAnalyticsService.getGroupEngagement.and.returnValue(
      of({ success: true, message: '', data: mockEngagement }),
    );
    mockAnalyticsService.getPersonalStats.and.returnValue(
      of({ success: true, message: '', data: mockPersonal }),
    );

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        provideIcons({}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit and fetchAnalytics
  });

  it('should create the home dashboard page component', () => {
    expect(component).toBeTruthy();
  });

  describe('Welcome Info Modal State', () => {
    it('should open welcome modal on load if user has not seen it before', () => {
      expect(component.showWelcomeInfoModal).toBeTrue();
    });

    it('should close welcome modal and save the seenWelcomeGuide flag in localStorage', () => {
      component.closeWelcomeInfo();

      expect(component.showWelcomeInfoModal).toBeFalse();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'seenWelcomeGuide',
        'true',
      );
    });

    it('should display welcome info modal on demand', () => {
      component.displayWelcomeInfo();
      expect(component.showWelcomeInfoModal).toBeTrue();
    });
  });

  describe('Analytics Data Loading', () => {
    it('should trigger getMostVotedIdeas and bind results', () => {
      expect(mockAnalyticsService.getMostVotedIdeas).toHaveBeenCalled();
      expect(component.mostVotedIdeas).toEqual(mockMostVoted);
    });

    it('should trigger getTopContributors and bind results', () => {
      expect(mockAnalyticsService.getTopContributors).toHaveBeenCalled();
      expect(component.topContributors).toEqual(mockContributors);
    });

    it('should trigger getPromotedIdeas and bind results', () => {
      expect(mockAnalyticsService.getPromotedIdeas).toHaveBeenCalled();
      expect(component.promotedIdeas).toEqual(mockPromoted);
    });

    it('should trigger getIdeaStatistics and bind results', () => {
      expect(mockAnalyticsService.getIdeaStatistics).toHaveBeenCalled();
      expect(component.ideaStats).toEqual(mockStats);
    });

    it('should trigger getGroupEngagement and bind results', () => {
      expect(mockAnalyticsService.getGroupEngagement).toHaveBeenCalled();
      expect(component.groupEngagement).toEqual(mockEngagement);
    });

    it('should trigger getPersonalStats and bind results', () => {
      expect(mockAnalyticsService.getPersonalStats).toHaveBeenCalled();
      expect(component.personalStats).toEqual(mockPersonal);
    });
  });

  describe('Idea Clicks Navigation', () => {
    it('should navigate straight to group ideas thread on idea click if user is group member', () => {
      const idea = mockMostVoted[0]; // isMember: true
      component.onIdeaClick(idea);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/groups', '10', 'ideas'],
        {
          queryParams: { ideaId: 1 },
        },
      );
    });

    it('should warn user and navigate to groups search lobby if not a member', () => {
      const idea = { ...mockMostVoted[0], isMember: false };
      component.onIdeaClick(idea);

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Join this group to view its ideas',
        'info',
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups'], {
        queryParams: { joinGroupId: 10 },
      });
    });
  });

  describe('Group Engagement Click Navigation', () => {
    it('should navigate directly to group ideas if member', () => {
      const groupEngage = { ...mockEngagement[0], isMember: true };
      component.onGroupClick(groupEngage);

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        '10',
        'ideas',
      ]);
    });

    it('should warn and redirect to groups index if not a member', () => {
      const groupEngage = mockEngagement[0]; // isMember: false
      component.onGroupClick(groupEngage);

      expect(mockToastService.show).toHaveBeenCalledWith(
        'Join Group to join IT Security to access its ideas',
        'info',
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups'], {
        queryParams: { joinGroupId: 10 },
      });
    });
  });

  describe('Promoted Idea Click Navigation', () => {
    it('should redirect to project viewer passing openProject query parameter', () => {
      const promotedIdea = mockPromoted[0];
      component.onPromotedIdeaClick(promotedIdea);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects'], {
        queryParams: { openProject: 301 },
      });
    });

    it('should exit quietly if no project is associated with the promoted idea', () => {
      const promotedIdea = {
        ...mockPromoted[0],
        projectId: undefined,
      } as unknown as PromotedIdea;
      component.onPromotedIdeaClick(promotedIdea);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
