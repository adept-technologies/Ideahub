/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IdeaScoringComponent } from './idea-scoring.component';
import { IdeasService } from '../../Services/ideas.services';
import { ScoringService } from '../../Services/scoring.services';
import { ToastService } from '../../Services/toast.service';
import { ProjectService } from '../../Services/project.service';
import { CommitteeMembersService } from '../../Services/committeemembers.service';
import { AuthService } from '../../Services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Idea,
  Verdict,
  BusinessCaseDto,
  ScoringDimensionsDto,
} from '../../Interfaces/Ideas/idea-interfaces';

describe('IdeaScoringComponent', () => {
  let component: IdeaScoringComponent;
  let fixture: ComponentFixture<IdeaScoringComponent>;

  let mockIdeasService: jasmine.SpyObj<IdeasService>;
  let mockScoringService: jasmine.SpyObj<ScoringService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockCommitteeService: jasmine.SpyObj<CommitteeMembersService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  let mockIdea: Idea;
  let mockBusinessCase: BusinessCaseDto;
  let mockDimensions: ScoringDimensionsDto;

  beforeEach(async () => {
    mockIdea = {
      id: 456,
      title: 'Decentralized API Gateway',
      description: 'Create a zero-trust edge gateway.',
      score: 75,
      currentStage: 'BusinessCase',
      aiReasoning: 'Highly scalable but average financial returns.',
      proposedSolution: 'Build modular Rust sidecars.',
      groupId: 'g123',
    } as unknown as Idea;

    mockBusinessCase = {
      Id: 10,
      IdeaId: 456,
      ExpectedBenefits: 'Time savings',
      ImpactScope: 'OrganizationWide',
      RiskLevel: 'Low',
      EvaluationStatus: 'Approved',
      OwnerDepartment: 'IT',
      NextSteps: 'PrototypeDevelopment',
      DecisionDate: '2026-06-30',
      PlannedDurationWeeks: 8,
      CurrentStage: 'InProgress',
      Verdict: 'Approved',
    } as unknown as BusinessCaseDto;

    mockDimensions = {
      Id: 20,
      IdeaId: 456,
      StrategicAlignment: 'Strong',
      CustomerImpact: 'High',
      FinancialBenefit: 'Moderate',
      Feasibility: 'High',
      TimeToValue: 'ThreeToSix',
      Cost: 'Moderate',
      Effort: 'Moderate',
      Risk: 'Low',
      Scalability: 'High',
      Differentiation: 'HighDifferentiation',
      SustainabilityImpact: 'StrongBenefit',
      ProjectConfidence: 'High',
      ReviewerComments: 'All targets aligned.',
    } as unknown as ScoringDimensionsDto;

    mockIdeasService = jasmine.createSpyObj('IdeasService', [
      'getIdea',
      'updateIdea',
    ]);
    mockScoringService = jasmine.createSpyObj('ScoringService', [
      'getBusinessCase',
      'getScoringDimensions',
      'saveBusinessCase',
      'saveScoringDimensions',
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'createProject',
    ]);
    mockCommitteeService = jasmine.createSpyObj('CommitteeMembersService', [
      'getAllUsers',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Set default service returns
    mockIdeasService.getIdea.and.returnValue(
      of({ success: true, message: '', data: mockIdea }),
    );
    mockIdeasService.updateIdea.and.returnValue(
      of({ success: true, message: 'Updated' }),
    );
    mockScoringService.getBusinessCase.and.returnValue(
      of({ success: true, message: '', data: mockBusinessCase }),
    );
    mockScoringService.getScoringDimensions.and.returnValue(
      of({ success: true, message: '', data: mockDimensions }),
    );
    mockCommitteeService.getAllUsers.and.returnValue(
      of({ success: true, message: '', data: [] }),
    );
    mockAuthService.getUserId.and.returnValue(of('user-admin-1'));

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'groupId') return 'g123';
            if (key === 'ideaId') return 'i456';
            return null;
          },
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [IdeaScoringComponent, ReactiveFormsModule],
      providers: [
        { provide: IdeasService, useValue: mockIdeasService },
        { provide: ScoringService, useValue: mockScoringService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: CommitteeMembersService, useValue: mockCommitteeService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IdeaScoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit, form init, and initial loads
  });

  it('should create the idea scoring page component', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Init and Path Parameters', () => {
    it('should retrieve groupId and ideaId parameters from the ActivatedRoute snapshot', () => {
      expect(component.groupId).toBe('g123');
      expect(component.ideaId).toBe('i456');
    });

    it('should compile complete multi-phase reactive forms', () => {
      expect(component.scoringForm).toBeTruthy();
      expect(component.scoringForm.get('Phase1')).toBeTruthy();
      expect(component.scoringForm.get('Phase2')).toBeTruthy();
      expect(component.scoringForm.get('Phase3')).toBeTruthy();
    });

    it('should load Idea information and patch Phase 1 values', () => {
      expect(mockIdeasService.getIdea).toHaveBeenCalledWith('g123', 'i456');
      expect(component.idea).toEqual(mockIdea);
      expect(component.scoringForm.get('Phase1.Score')?.value).toBe(75);
    });

    it('should query Business Case details and populate Phase 2 controls', () => {
      expect(mockScoringService.getBusinessCase).toHaveBeenCalledWith('i456');
      expect(component.scoringForm.get('Phase2.ExpectedBenefits')?.value).toBe(
        'Time savings',
      );
      expect(component.scoringForm.get('Phase2.Verdict')?.value).toBe(
        'Approved',
      );
    });
  });

  describe('Accordion Locking States', () => {
    it('should unlock Phase 2 if Phase 1 score is equal to or greater than 70', () => {
      component.scoringForm.get('Phase1.Score')?.setValue(75);
      expect(component.isSectionLocked('phase2')).toBeFalse();
    });

    it('should lock Phase 2 if Phase 1 score falls below 70', () => {
      component.scoringForm.get('Phase1.Score')?.setValue(65);
      expect(component.isSectionLocked('phase2')).toBeTrue();
    });

    it('should unlock Phase 3 if Phase 2 is unlocked and Verdict is Approved', () => {
      component.scoringForm.get('Phase1.Score')?.setValue(80);
      component.scoringForm.get('Phase2.Verdict')?.setValue(Verdict.Approved);

      expect(component.isSectionLocked('phase3')).toBeFalse();
    });

    it('should lock Phase 3 if Phase 2 Verdict is not Approved', () => {
      component.scoringForm.get('Phase1.Score')?.setValue(80);
      component.scoringForm.get('Phase2.Verdict')?.setValue(Verdict.Park);

      expect(component.isSectionLocked('phase3')).toBeTrue();
    });
  });

  describe('Value Clamping Utility', () => {
    it('should clamp scores exceeding 100 down to 100', () => {
      const mockEvent = {
        target: { value: '120' },
      } as unknown as Event;

      component.clampScore(mockEvent);

      expect((mockEvent.target as HTMLInputElement).value).toBe('100');
      expect(component.scoringForm.get('Phase1.Score')?.value).toBe(100);
    });

    it('should clamp negative scores up to 0', () => {
      const mockEvent = {
        target: { value: '-15' },
      } as unknown as Event;

      component.clampScore(mockEvent);

      expect((mockEvent.target as HTMLInputElement).value).toBe('0');
      expect(component.scoringForm.get('Phase1.Score')?.value).toBe(0);
    });
  });

  describe('Saving Score Modifications', () => {
    it('should update Phase 1 score successfully and show toast feedback', () => {
      component.scoringForm.get('Phase1.Score')?.setValue(90);
      component.updatePhase1Score();

      expect(mockIdeasService.updateIdea).toHaveBeenCalledWith('i456', {
        Score: 90,
      });
      expect(mockToastService.show).toHaveBeenCalledWith(
        'Evaluation score updated successfully',
        'success',
      );
      expect(component.idea?.Score).toBe(90);
    });
  });
});
