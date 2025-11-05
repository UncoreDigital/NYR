import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomerComponent } from './components/customer/customer.component';
import { AddCustomerComponent } from './components/customer/add-customer/add-customer.component';
import { LocationComponent } from './components/location/location.component';
import { AddLocationComponent } from './components/location/add-location/add-location.component';
import { UserComponent } from './components/user/user.component';
import { AddUserComponent } from './components/user/add-user/add-user.component';
import { SupplierComponent } from './components/supplier/supplier.component';
import { AddSupplierComponent } from './components/supplier/add-supplier/add-supplier.component';
import { VanComponent } from './components/van/van.component';
import { AddVanComponent } from './components/van/add-van/add-van.component';
import { WarehouseComponent } from './components/warehouse/warehouse.component';
import { AddWarehouseComponent } from './components/warehouse/add-warehouse/add-warehouse.component';
import { ProductComponent } from './components/product/product.component';
import { AddProductComponent } from './components/product/add-product/add-product.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SuppliesComponent } from './components/supplies/supplies.component';
import { TransfersComponent } from './components/transfers/transfers.component';
import { TransferDetailComponent } from './components/transferDetail/transfer-detail.component';
import { RoutesComponent } from './components/routes/routes.component';
import { CreateRouteComponent } from './components/create-route/create-route.component';
import { RouteDetailComponent } from './components/route-detail/route-detail.component';
import { RouteMapComponent } from './components/route-map/route-map.component';
import { InventoryWarehouseComponent } from './components/inventory-warehouse/inventory-warehouse.component';
import { AddInventoryComponent } from './components/inventory-warehouse/add-inventory/add-inventory.component';
import { InventoryVanComponent } from './components/inventory-van/inventory-van.component';
import { TransferVanComponent } from './components/transfer-van/transfer-van.component';
import { InventoryLocationComponent } from './components/inventory-location/inventory-location.component';
import { TransferLocationComponent } from './components/transfer-location/transfer-location.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { InventoryDetailComponent } from './components/inventory-detail/inventory-detail.component';
import { ScannerComponent } from './components/scanner/scanner.component';
import { AddScannerComponent } from './components/scanner/add-scanner/add-scanner.component';
import { VariationComponent } from './components/variation/variation.component';
import { AddVariationComponent } from './components/variation/add-variation/add-variation.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'customer', 
    component: CustomerComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'customer/add', 
    component: AddCustomerComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'customer/edit/:id', 
    component: AddCustomerComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'location', 
    component: LocationComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'location/add', 
    component: AddLocationComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'location/edit/:id', 
    component: AddLocationComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'users', 
    component: UserComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  { 
    path: 'users/add', 
    component: AddUserComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  { 
    path: 'users/edit/:id', 
    component: AddUserComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] }
  },
  { 
    path: 'supplier', 
    component: SupplierComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'supplier/add', 
    component: AddSupplierComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'supplier/edit/:id', 
    component: AddSupplierComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'van', 
    component: VanComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'van/add', 
    component: AddVanComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'van/edit/:id', 
    component: AddVanComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'warehouse', 
    component: WarehouseComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'warehouse/add', 
    component: AddWarehouseComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'warehouse/edit/:id', 
    component: AddWarehouseComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'product', 
    component: ProductComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'product/add', 
    component: AddProductComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'product/edit/:id', 
    component: AddProductComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'supplies', 
    component: SuppliesComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'transfers', 
    component: TransfersComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'transferDetail', 
    component: TransferDetailComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'routes', 
    component: RoutesComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'create-route', 
    component: CreateRouteComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'route-detail', 
    component: RouteDetailComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'route-map', 
    component: RouteMapComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'inwarehouse', 
    component: InventoryWarehouseComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'inwarehouse/add', 
    component: AddInventoryComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'invans', 
    component: InventoryVanComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'tovan', 
    component: TransferVanComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'inlocation', 
    component: InventoryLocationComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'tolocation', 
    component: TransferLocationComponent, 
    canActivate: [AuthGuard] 
  },
  { path: 'inventory-detail', 
    component: InventoryDetailComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'scanner', 
    component: ScannerComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'scanner/add', 
    component: AddScannerComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'scanner/edit/:id', 
    component: AddScannerComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'variation', 
    component: VariationComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'variation/add', 
    component: AddVariationComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'variation/edit/:id', 
    component: AddVariationComponent, 
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }