import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
// import { MoviesComponent } from './components/movies/movies.component';
// import { TvComponent } from './components/tv/tv.component';
import { MoviesInfoComponent } from './components/movies-info/movies-info.component';
// import { TvInfoComponent } from './components/tv-info/tv-info.component';
// import { PersonComponent } from './components/person/person.component';
import { MovieCategoryComponent } from './components/movie-category/movie-category.component';
// import { TvCategoryComponent } from './components/tv-category/tv-category.component';
// import { GenreComponent } from './components/genre/genre.component';
import { SearchComponent } from './components/global/search/search.component';
// import { EpisodesComponent } from './components/global/episodes/episodes.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'movie',
    component: MovieCategoryComponent,
  },
  {
    path: 'movie/:id',
    component: MoviesInfoComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
