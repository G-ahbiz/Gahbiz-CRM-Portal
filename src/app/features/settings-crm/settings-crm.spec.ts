import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCrm } from './settings-crm';

describe('SettingsCrm', () => {
  let component: SettingsCrm;
  let fixture: ComponentFixture<SettingsCrm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsCrm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsCrm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
