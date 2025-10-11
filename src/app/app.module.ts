import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomerComponent } from './components/customer/customer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { LocationComponent } from './components/location/location.component';
import { AddLocationComponent } from './components/location/add-location/add-location.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { AddUserComponent } from './components/user/add-user/add-user.component';
import { UserComponent } from './components/user/user.component';
import { SupplierComponent } from './components/supplier/supplier.component';
import { VanComponent } from './components/van/van.component';
import { WarehouseComponent } from './components/warehouse/warehouse.component';
import { ProductComponent } from './components/product/product.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SuppliesComponent } from './components/supplies/supplies.component';
import { TransfersComponent } from './components/transfers/transfers.component';
import { TransferDetailComponent } from './components/transferDetail/transfer-detail.component';
import { RoutesComponent } from './components/routes/routes.component';
import { CreateRouteComponent } from './components/create-route/create-route.component';
import { RouteDetailComponent } from './components/route-detail/route-detail.component';
import { InventoryWarehouseComponent } from './components/inventory-warehouse/inventory-warehouse.component';
import { InventoryVanComponent } from './components/inventory-van/inventory-van.component';
import { TransferVanComponent } from './components/transfer-van/transfer-van.component';
import { InventoryLocationComponent } from './components/inventory-location/inventory-location.component';
import { TransferLocationComponent } from './components/transfer-location/transfer-location.component';
import { ToastComponent } from './components/toast/toast.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { InventoryDetailComponent } from './components/inventory-detail/inventory-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    CustomerComponent,
    LocationComponent,
    AddLocationComponent,
    ConfirmDialogComponent,
    AddUserComponent,
    UserComponent,
    SupplierComponent,
    VanComponent,
    WarehouseComponent,
    ProductComponent,
    ProfileComponent,
    TransfersComponent,
    TransferDetailComponent,
    RoutesComponent,
    CreateRouteComponent,
    RouteDetailComponent,
    InventoryWarehouseComponent,
    InventoryVanComponent,
    TransferVanComponent,
    InventoryLocationComponent,
    TransferLocationComponent,
    ToastComponent
    InventoryDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    SidebarComponent,
    HeaderComponent,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }