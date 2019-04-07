import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomspecialComponent } from './customspecial.component';

describe('CustomspecialComponent', () => {
  let component: CustomspecialComponent;
  let fixture: ComponentFixture<CustomspecialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomspecialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomspecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
