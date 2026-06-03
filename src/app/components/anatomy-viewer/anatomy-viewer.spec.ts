import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnatomyViewer } from './anatomy-viewer';

describe('AnatomyViewer', () => {
  let component: AnatomyViewer;
  let fixture: ComponentFixture<AnatomyViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnatomyViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(AnatomyViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
