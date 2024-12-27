import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ManageMovieComponent } from './components/manage-movie/manage-movie.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { redirectGuard } from './guards/redirect.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [authGuard] },
    { path: 'manage', component: ManageMovieComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent, canActivate: [redirectGuard] },
];
