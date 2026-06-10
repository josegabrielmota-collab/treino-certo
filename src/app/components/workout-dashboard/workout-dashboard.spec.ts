import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutDashboardComponent } from './workout-dashboard';

describe('WorkoutDashboardComponent', () => {
  let component: WorkoutDashboardComponent;
  let fixture: ComponentFixture<WorkoutDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
