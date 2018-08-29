import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineeditComponent } from './inlineedit.component';

describe('InlineeditComponent', () => {
  let component: InlineeditComponent;
  let fixture: ComponentFixture<InlineeditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineeditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
