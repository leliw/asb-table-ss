import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OscarsDeleteComponent } from './oscars-delete.component';

describe('OscarsDeleteComponent', () => {
  let component: OscarsDeleteComponent;
  let fixture: ComponentFixture<OscarsDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OscarsDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OscarsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
