/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BaseLayoutComponent } from './base-layout.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

@Component({
  template: `
    <app-base-layout>
      <div id="test-content">Projected Main Body Content</div>
    </app-base-layout>
  `,
  imports: [BaseLayoutComponent],
  standalone: true,
})
class TestHostComponent {}

describe('BaseLayoutComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, BaseLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should create the base layout component', () => {
    const layoutEl = hostFixture.debugElement.query(By.css('app-base-layout'));
    expect(layoutEl).toBeTruthy();
  });

  it('should render the sidebar wrapper and sidebar element', () => {
    const sidebarWrapper = hostFixture.debugElement.query(By.css('.sidebar-wrapper'));
    const sidebarEl = hostFixture.debugElement.query(By.css('app-sidebar'));

    expect(sidebarWrapper).toBeTruthy();
    expect(sidebarEl).toBeTruthy();
  });

  it('should render projected content inside the main-content container', () => {
    const mainContentContainer = hostFixture.debugElement.query(By.css('.main-content'));
    expect(mainContentContainer).toBeTruthy();

    const projectedEl = hostFixture.debugElement.query(By.css('#test-content'));
    expect(projectedEl).toBeTruthy();
    expect(projectedEl.nativeElement.textContent.trim()).toBe('Projected Main Body Content');
  });
});
