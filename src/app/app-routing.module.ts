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

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'customer/add', component: AddCustomerComponent },
  { path: 'location', component: LocationComponent },
  { path: 'location/add', component: AddLocationComponent },
  { path: 'users', component: UserComponent },
  { path: 'users/add', component: AddUserComponent },
  { path: 'supplier', component: SupplierComponent },
  { path: 'supplier/add', component: AddSupplierComponent },
  { path: 'van', component: VanComponent },
  { path: 'van/add', component: AddVanComponent },
  { path: 'warehouse', component: WarehouseComponent },
  { path: 'warehouse/add', component: AddWarehouseComponent },
  { path: 'product', component: ProductComponent },
  { path: 'product/add', component: AddProductComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'supplies', component: SuppliesComponent },
  { path: 'transfers', component: TransfersComponent },
  { path: 'transferDetail', component: TransferDetailComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }