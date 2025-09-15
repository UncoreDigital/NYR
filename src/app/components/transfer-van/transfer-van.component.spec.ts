import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferVanComponent } from './transfer-van.component';

describe('TransferVanComponent', () => {
  let component: TransferVanComponent;
  let fixture: ComponentFixture<TransferVanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferVanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransferVanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
