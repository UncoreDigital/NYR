import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryWarehouseComponent } from './inventory-warehouse.component';

describe('InventoryWarehouseComponent', () => {
  let component: InventoryWarehouseComponent;
  let fixture: ComponentFixture<InventoryWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryWarehouseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
