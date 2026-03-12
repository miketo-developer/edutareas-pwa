import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuroAlumnoComponent } from './muro-alumno.component';

describe('MuroAlumnoComponent', () => {
  let component: MuroAlumnoComponent;
  let fixture: ComponentFixture<MuroAlumnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuroAlumnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuroAlumnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
