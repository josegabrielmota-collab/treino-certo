import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnatomyViewerComponent } from './anatomy-viewer';

describe('AnatomyViewerComponent', () => {
  let component: AnatomyViewerComponent;
  let fixture: ComponentFixture<AnatomyViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnatomyViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnatomyViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
