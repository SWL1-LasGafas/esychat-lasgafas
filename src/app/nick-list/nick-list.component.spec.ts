import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NickListComponent } from './nick-list.component';

describe('NickListComponent', () => {
  let component: NickListComponent;
  let fixture: ComponentFixture<NickListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NickListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NickListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
