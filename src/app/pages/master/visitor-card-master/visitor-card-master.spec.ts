import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorCardMaster } from './visitor-card-master';

describe('VisitorCardMaster', () => {
  let component: VisitorCardMaster;
  let fixture: ComponentFixture<VisitorCardMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorCardMaster]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorCardMaster);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
