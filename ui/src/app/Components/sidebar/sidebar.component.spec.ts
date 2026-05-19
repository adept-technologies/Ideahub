/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the sidebar component', () => {
    expect(component).toBeTruthy();
  });

  describe('Sidebar Expansion and Toggling States', () => {
    it('should initialize with isSidebarExpanded as false', () => {
      expect(component.isSidebarExpanded).toBeFalse();
    });

    it('should apply the closed class to .sidebar-content initially', () => {
      const contentEl = fixture.debugElement.query(By.css('.sidebar-content'));
      expect(contentEl).toBeTruthy();
      expect(contentEl.nativeElement.classList.contains('closed')).toBeTrue();
    });

    it('should flip expansion status and remove closed class when toggleSidebar is called', () => {
      const contentEl = fixture.debugElement.query(By.css('.sidebar-content'));

      component.toggleSidebar();
      fixture.detectChanges();

      expect(component.isSidebarExpanded).toBeTrue();
      expect(contentEl.nativeElement.classList.contains('closed')).toBeFalse();

      // Toggle back to closed
      component.toggleSidebar();
      fixture.detectChanges();

      expect(component.isSidebarExpanded).toBeFalse();
      expect(contentEl.nativeElement.classList.contains('closed')).toBeTrue();
    });
  });

  describe('Navigation Links Rendering', () => {
    it('should render the link to Home (/home)', () => {
      const homeLink = fixture.debugElement.query(By.css('a[routerLink="/home"]'));
      expect(homeLink).toBeTruthy();

      const matIcon = homeLink.query(By.css('mat-icon'));
      const textSpan = homeLink.query(By.css('.link-text'));

      expect(matIcon.nativeElement.textContent.trim()).toBe('home');
      expect(textSpan.nativeElement.textContent.trim()).toBe('Home');
    });

    it('should render the link to Groups (/groups)', () => {
      const groupsLink = fixture.debugElement.query(By.css('a[routerLink="/groups"]'));
      expect(groupsLink).toBeTruthy();

      const matIcon = groupsLink.query(By.css('mat-icon'));
      const textSpan = groupsLink.query(By.css('.link-text'));

      expect(matIcon.nativeElement.textContent.trim()).toBe('groups');
      expect(textSpan.nativeElement.textContent.trim()).toBe('Groups');
    });

    it('should render the link to Projects (/projects)', () => {
      const projectsLink = fixture.debugElement.query(By.css('a[routerLink="/projects"]'));
      expect(projectsLink).toBeTruthy();

      const matIcon = projectsLink.query(By.css('mat-icon'));
      const textSpan = projectsLink.query(By.css('.link-text'));

      expect(matIcon.nativeElement.textContent.trim()).toBe('topic');
      expect(textSpan.nativeElement.textContent.trim()).toBe('Projects');
    });
  });
});
