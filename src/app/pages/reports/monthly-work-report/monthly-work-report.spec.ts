import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyWorkReport } from './monthly-work-report';

describe('MonthlyWorkReport', () => {
  let component: MonthlyWorkReport;
  let fixture: ComponentFixture<MonthlyWorkReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyWorkReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyWorkReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
