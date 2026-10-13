import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPermitCardMaster } from './work-permit-card-master';

describe('WorkPermitCardMaster', () => {
  let component: WorkPermitCardMaster;
  let fixture: ComponentFixture<WorkPermitCardMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPermitCardMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkPermitCardMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
