import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuroMaestroComponent } from './muro-maestro.component';

describe('MuroMaestroComponent', () => {
  let component: MuroMaestroComponent;
  let fixture: ComponentFixture<MuroMaestroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuroMaestroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuroMaestroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
