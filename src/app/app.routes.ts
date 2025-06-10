import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './pages/login/login.component';
import { DataComponent } from './pages/data/data.component';
import { ParkingComponent } from './pages/parking/parking.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'data', component: DataComponent },
  { path: 'parking', component: ParkingComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginComponent },
];
