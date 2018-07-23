import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintableComponent } from './maintable.component';

describe('MaintableComponent', () => {
  let component: MaintableComponent;
  let fixture: ComponentFixture<MaintableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
