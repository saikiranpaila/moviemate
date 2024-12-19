import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api/api.service';
import { Movie, MoviesResponse } from '../../models/Movies';

@Component({
  selector: 'app-movie-category',
  templateUrl: './movie-category.component.html',
  styleUrls: ['./movie-category.component.scss']
})
export class MovieCategoryComponent implements OnInit {

  page: number = 1;
  perPage: number = 20;
  isLoading: boolean = false;
  movies: Movie[] = []
  pageAvailable: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    this.updateMoviesList()
  }

  updateMoviesList() {
    this.isLoading = true;
    this.apiService.getMovies(this.page, this.perPage).subscribe({
      next: (res: MoviesResponse) => {
        this.movies.push(...res.result)
        this.page = parseInt(res.page) + 1
        if (parseInt(res.page) >= res.totalPages) {
          this.pageAvailable = false
        } else {
          this.pageAvailable = true
        }
      },
      error: (err) => { console.log(err) }
    })
    this.isLoading = false;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
    const max = document.documentElement.scrollHeight || document.body.scrollHeight;
    if (this.isLoading) {
      if (this.pageAvailable) {
        if (pos > max - 100) {
          this.updateMoviesList();
        }
      }
    }
  }
}
