import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ManageMovieComponent } from './components/manage-movie/manage-movie.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'manage', component: ManageMovieComponent }
];
