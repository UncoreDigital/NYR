import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryVanComponent } from './inventory-van.component';

describe('InventoryVanComponent', () => {
  let component: InventoryVanComponent;
  let fixture: ComponentFixture<InventoryVanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryVanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryVanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
