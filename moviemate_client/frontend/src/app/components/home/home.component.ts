import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { MoviesResponse } from '../../models/Movies';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  moviesSlider: any[] = [];
  tvSlider: any[] = [];
  movies_data!: MoviesResponse;


  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.updateMoviesData();
  }

  updateMoviesData() {
    this.apiService.getMovies(1, 10).subscribe({
      next: (v: MoviesResponse) => this.movies_data = v,
      error: (e: any) => console.error(e),
      complete: () => console.info('complete')
    })
  }

}
