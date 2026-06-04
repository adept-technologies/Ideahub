/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MediaComponent } from './media.component';
import { MediaService } from '../../Services/media.service';
import { AppConfigService } from '../../core/services/app-config.service';
import { MediaType, Media } from '../../Interfaces/Media/media-interface';
import { of, throwError } from 'rxjs';
import { SimpleChange } from '@angular/core';

describe('MediaComponent', () => {
  let component: MediaComponent;
  let fixture: ComponentFixture<MediaComponent>;
  let mockMediaService: jasmine.SpyObj<MediaService>;
  let mockAppConfigService: { apiUrl: string };
  let mockMediaList: Media[];

  beforeEach(async () => {
    mockMediaList = [
      {
        id: 'm1',
        filePath: 'media/12345_document.pdf',
        mediaType: MediaType.Document,
      } as unknown as Media,
      {
        id: 'm2',
        filePath: 'media/67890_avatar.png',
        mediaType: MediaType.Image,
      } as unknown as Media,
    ];

    mockMediaService = jasmine.createSpyObj('MediaService', ['viewMedia']);
    mockAppConfigService = { apiUrl: 'https://company.com/api' };

    mockMediaService.viewMedia.and.returnValue(
      of({ success: true, message: '', data: mockMediaList }),
    );

    await TestBed.configureTestingModule({
      imports: [MediaComponent],
      providers: [
        { provide: MediaService, useValue: mockMediaService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaComponent);
    component = fixture.componentInstance;
  });

  it('should create the media component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Media Load Triggers', () => {
    it('should exit quietly and not query API if no source IDs are input', () => {
      component.ideaId = undefined;
      component.projectId = undefined;
      component.commentId = undefined;
      component.timesheetId = undefined;
      component.projectTaskId = undefined;
      component.subTaskId = undefined;

      fixture.detectChanges(); // Triggers ngOnInit -> loadMedia

      expect(mockMediaService.viewMedia).not.toHaveBeenCalled();
      expect(component.mediaList.length).toBe(0);
    });

    it('should query API and bind mediaList when ideaId input is passed', () => {
      component.ideaId = 'idea-99';
      fixture.detectChanges(); // ngOnInit

      expect(mockMediaService.viewMedia).toHaveBeenCalledWith(
        'idea-99',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(component.mediaList).toEqual(mockMediaList);
    });

    it('should query API when inputs change dynamically via ngOnChanges', () => {
      component.ideaId = 'idea-99';
      fixture.detectChanges(); // ngOnInit loads

      mockMediaService.viewMedia.calls.reset();

      // Trigger changes
      component.projectId = 500;
      component.ngOnChanges({
        projectId: new SimpleChange(undefined, 500, false),
      });

      expect(mockMediaService.viewMedia).toHaveBeenCalledWith(
        'idea-99',
        undefined,
        500,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should handle API errors safely and toggle loading state off', () => {
      mockMediaService.viewMedia.and.returnValue(
        throwError(() => new Error('Service Error')),
      );
      component.ideaId = 'idea-99';

      component.loadMedia();

      expect(component.isLoading).toBeFalse();
      expect(component.mediaList.length).toBe(0);
    });
  });

  describe('Utility Helper Parsers', () => {
    it('should parse and clean target URL by stripping the API suffix and stripping media/ prefix', () => {
      const result = component.getMediaUrl('media/user_photos/avatar.png');
      expect(result).toBe('https://company.com/uploads/user_photos/avatar.png');
    });

    it('should extract correct uppercase file extension and default to FILE if missing', () => {
      expect(component.getFileExtension('archive.zip')).toBe('ZIP');
      expect(component.getFileExtension('invoice.PDF')).toBe('PDF');
      expect(component.getFileExtension('filewithoutdot')).toBe(
        'FILEWITHOUTDOT',
      );
    });

    it('should format display names by stripping out unique underscore prefixes', () => {
      expect(component.getDisplayName('media/1234_specification.xlsx')).toBe(
        'specification.xlsx',
      );
      expect(component.getDisplayName('media/avatar.png')).toBe('avatar.png');
      expect(component.getDisplayName('')).toBe('attachment');
    });
  });

  describe('Media Opener Actions', () => {
    it('should create a dynamic link tag clicking download rel to force document opening', () => {
      const docMedia = mockMediaList[0]; // Document PDF
      const linkSpy = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
      spyOn(document, 'createElement').and.returnValue(linkSpy);

      component.openMedia(docMedia);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(linkSpy.href).toBe(
        'https://company.com/uploads/12345_document.pdf',
      );
      expect(linkSpy.target).toBe('_blank');
      expect(linkSpy.rel).toBe('noopener noreferrer');
      expect(linkSpy.click).toHaveBeenCalled();
    });

    it('should call window.open for images and other media types', () => {
      const imageMedia = mockMediaList[1]; // Image PNG
      spyOn(window, 'open');

      component.openMedia(imageMedia);

      expect(window.open).toHaveBeenCalledWith(
        'https://company.com/uploads/67890_avatar.png',
        '_blank',
      );
    });
  });
});
