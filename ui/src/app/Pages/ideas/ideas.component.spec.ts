/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IdeasComponent } from './ideas.component';
import { IdeasService } from '../../Services/ideas.services';
import { GroupsService } from '../../Services/groups.service';
import { AuthService } from '../../Services/auth/auth.service';
import { VoteService } from '../../Services/vote.service';
import { ToastService } from '../../Services/toast.service';
import { CommentsService } from '../../Services/comments.service';
import { MediaService } from '../../Services/media.service';
import { CommitteeMembersService } from '../../Services/committeemembers.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Idea, viewComment } from '../../Interfaces/Ideas/idea-interfaces';
import { of, BehaviorSubject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('IdeasComponent', () => {
  let component: IdeasComponent;
  let fixture: ComponentFixture<IdeasComponent>;

  let mockIdeasService: jasmine.SpyObj<IdeasService>;
  let mockGroupsService: jasmine.SpyObj<GroupsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockVoteService: jasmine.SpyObj<VoteService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockCommentService: jasmine.SpyObj<CommentsService>;
  let mockMediaService: jasmine.SpyObj<MediaService>;
  let mockCommitteeService: jasmine.SpyObj<CommitteeMembersService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  let mockIdeas: Idea[];
  let mockComments: viewComment[];

  let paramsSubject: BehaviorSubject<unknown>;
  let queryParamsSubject: BehaviorSubject<unknown>;

  beforeEach(async () => {
    mockIdeas = [
      {
        id: '1',
        Title: 'Decentralized Ideation Flow',
        ProblemStatement: 'Bottlenecks in brainstorming.',
        ProposedSolution: 'Relational node graph matching.',
        StrategicAlignment: 'Corporate Innovation',
        UseCase: 'R&D Teams',
        InnovationCategory: 'Process Optimization',
        UserId: 'u1',
        userId: 'u1',
        groupId: 'g1',
        status: 'Open',
        voteCount: 10,
        createdAt: new Date('2026-05-18T00:00:00Z'),
        updatedAt: new Date('2026-05-18T00:00:00Z'),
        Score: 80,
        score: 80,
        isPromotedToProject: false,
        isDeleted: false,
        userVoted: false,
      } as unknown as Idea,
      {
        id: '2',
        Title: 'Automated Container Scanner',
        ProblemStatement: 'Vulnerable docker base images.',
        ProposedSolution: 'Snyk/Semgrep integrated actions.',
        StrategicAlignment: 'Security Compliance',
        UseCase: 'DevOps pipelines',
        InnovationCategory: 'Automation',
        UserId: 'u2',
        userId: 'u2',
        groupId: 'g1',
        status: 'Closed',
        voteCount: 5,
        createdAt: new Date('2026-05-19T00:00:00Z'),
        updatedAt: new Date('2026-05-19T00:00:00Z'),
        Score: 60,
        score: 60,
        isPromotedToProject: false,
        isDeleted: false,
        userVoted: false,
      } as unknown as Idea,
    ];

    mockComments = [
      {
        id: 101,
        content: 'Brilliant proposal!',
        createdAt: '2026-05-18T10:00:00Z',
        userId: 'u2',
        userName: 'Bob Member',
      } as unknown as viewComment,
    ];

    mockIdeasService = jasmine.createSpyObj('IdeasService', [
      'getIdeasByGroup',
      'getIdeasInfo',
      'createIdea',
      'updateIdea',
      'getIdea',
      'voteForIdea',
      'removeVote',
      'getVotesForIdea',
      'closeIdea',
    ]);
    mockGroupsService = jasmine.createSpyObj('GroupsService', [
      'getGroups',
      'getGroupMembers',
      'viewRequests',
      'acceptRequest',
      'rejectRequest',
      'leaveGroup',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getUserId',
      'getCurrentUser',
    ]);
    mockVoteService = jasmine.createSpyObj('VoteService', [
      'castVote',
      'unvote',
      'seeVotes',
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show', 'remove']);
    mockCommentService = jasmine.createSpyObj('CommentsService', [
      'getComments',
      'postComment',
      'deleteComment',
    ]);
    mockMediaService = jasmine.createSpyObj('MediaService', [
      'uploadMedia',
      'detectMediaType',
      'viewMedia',
    ]);
    mockCommitteeService = jasmine.createSpyObj('CommitteeMembersService', [
      'getCommitteeMembers',
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    paramsSubject = new BehaviorSubject<unknown>({ groupId: 'g1' });
    queryParamsSubject = new BehaviorSubject<unknown>({
      ideaId: '1',
      commentId: '101',
    });

    mockAuthService.getUserId.and.returnValue(of('u1'));
    mockAuthService.getCurrentUser.and.returnValue(
      of({ id: 'u1', email: 'alice@company.com', roles: [] } as never),
    );
    mockIdeasService.getIdeasByGroup.and.returnValue(
      of({ success: true, message: '', data: mockIdeas }),
    );
    mockGroupsService.getGroupMembers.and.returnValue(
      of({ success: true, message: '', data: [] }),
    );
    mockGroupsService.getGroups.and.returnValue(
      of({
        success: true,
        message: '',
        data: [
          { id: 'g1', name: 'Alchemists', createdByUserId: 'u1' } as never,
        ],
      }),
    );
    mockCommentService.getComments.and.returnValue(
      of({ success: true, message: '', data: mockComments }),
    );
    mockCommentService.postComment.and.returnValue(
      of({ success: true, message: '', data: { id: 102 } as never }),
    );
    mockMediaService.uploadMedia.and.returnValue(
      of({ success: true, message: '' }),
    );
    mockMediaService.viewMedia.and.returnValue(
      of({ success: true, message: '', data: [] }),
    );
    mockCommitteeService.getCommitteeMembers.and.returnValue(
      of({ success: true, message: '', data: [] }),
    );

    await TestBed.configureTestingModule({
      imports: [IdeasComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: IdeasService, useValue: mockIdeasService },
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: VoteService, useValue: mockVoteService },
        { provide: ToastService, useValue: mockToastService },
        { provide: CommentsService, useValue: mockCommentService },
        { provide: MediaService, useValue: mockMediaService },
        { provide: CommitteeMembersService, useValue: mockCommitteeService },
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable(),
            queryParams: queryParamsSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IdeasComponent);
    component = fixture.componentInstance;
  });

  it('should create the ideas component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should boot OnInit, query group info, and load ideas list', () => {
      fixture.detectChanges(); // Triggers ngOnInit

      expect(component.groupId).toBe('g1');
      expect(component.currentUserId).toBe('u1');
      expect(component.ideas.length).toBe(1); // Standard view filters out CLOSED ideas
      expect(component.ideas[0].id).toBe('1'); // Only ID: 1 is Open
    });
  });

  describe('Filter Closed Ideas', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter open and closed ideas list successfully on toggleViewClosedIdeas', () => {
      expect(component.showClosedIdeas).toBeFalse();
      expect(component.ideas.length).toBe(1); // Only active open ideas shown

      component.toggleViewClosedIdeas();

      expect(component.showClosedIdeas).toBeTrue();
      expect(component.ideas.length).toBe(1);
      expect(component.ideas[0].id).toBe('2'); // ID: 2 is Closed
    });
  });

  describe('Multi-mode Sorters', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Reset ideas to represent multiple open ideas
      component.ideas = [
        {
          id: '1',
          Title: 'A',
          voteCount: 5,
          Score: 40,
          createdAt: new Date('2026-05-18'),
        } as unknown as Idea,
        {
          id: '2',
          Title: 'B',
          voteCount: 15,
          Score: 90,
          createdAt: new Date('2026-05-20'),
        } as unknown as Idea,
      ];
    });

    it('should sort ideas array by top votes', () => {
      component.setSortMode('top');
      expect(component.ideas[0].id).toBe('2'); // Higher vote Count first
    });

    it('should sort ideas array by newest created date first', () => {
      component.setSortMode('newest');
      expect(component.ideas[0].id).toBe('2'); // Latest created date first
    });

    it('should sort ideas array by highest score first', () => {
      component.setSortMode('highest-scored');
      expect(component.ideas[0].id).toBe('2'); // Highest evaluation score first
    });
  });

  describe('Comments Section Actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.selectedIdea = mockIdeas[0]; // ID: 1
    });

    it('should load comments for a selected idea', () => {
      component.selectIdea(mockIdeas[0]);

      expect(mockCommentService.getComments).toHaveBeenCalledWith(1);
      expect(component.comments).toEqual(mockComments);
    });

    it('should show warning toast and block empty comments', async () => {
      component.newCommentContent = '   ';
      await component.addComment();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'To post a comment, you are required to provide one',
        'info',
      );
      expect(mockCommentService.postComment).not.toHaveBeenCalled();
    });

    it('should successfully post a comment DTO and reload comments list', async () => {
      component.newCommentContent = 'Great design!';
      await component.addComment();

      expect(mockCommentService.postComment).toHaveBeenCalledWith(1, {
        content: 'Great design!',
      });
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Comment posted',
        'success',
      );
      expect(component.newCommentContent).toBe('');
    });

    it('should delete comments and update comments array locally', () => {
      mockCommentService.deleteComment.and.returnValue(
        of({ success: true, message: '' }),
      );
      component.comments = [...mockComments];

      component.deleteComment(101);

      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(101);
      expect(component.comments.length).toBe(0);
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Comment deleted',
        'success',
      );
    });
  });

  describe('Edit modal mapping', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should trigger edit state with deep copies of selected idea', () => {
      const targetIdea = mockIdeas[0];
      component.openEditModal(targetIdea);

      expect(component.isEditMode).toBeTrue();
      expect(component.modalEditData.id).toBe(targetIdea.id);
      expect(component.modalEditData.Title).toBe(targetIdea.Title);
    });
  });
});
