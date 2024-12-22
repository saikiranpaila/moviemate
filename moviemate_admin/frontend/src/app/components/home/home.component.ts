import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { Movie } from '../../models/Movies';
import { StreamUpdateComponent } from '../stream-update/stream-update.component';
import { ToastComponent } from '../toast/toast.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [StreamUpdateComponent, ToastComponent, ModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  movies!: Movie[]
  movieControl!: MovieControl[]
  @ViewChild('toast') toast!: ToastComponent;
  @ViewChild('modal') modal!: ModalComponent;
  constructor(private router: Router, private backend: BackendService) {
  }
  ngOnInit() {
    this.getMovies()
  }
  getMovies() {
    this.backend.getMovies().subscribe({
      next: (res) => {
        this.movies = res.result; // Assuming the result contains the movies array
        // Initialize movieBool array with the same length as movies, filled with default values
        this.movieControl = this.movies.map((movie) => ({
          movieID: movie.id, trailer: false, movie: false, main: true
        }));
      },
      error: (err) => {
        console.log("error", err);
        this.toast.showToast("Unable to load Movies", false);
      }
    });
  }
  manageMovie() {
    this.router.navigate(['/manage'])
  }

  refresh(index: number) {
    this.backend.getMovie(this.movieControl[index].movieID).subscribe(
      {
        next: (res: Movie) => {
          this.movies[index] = { ...this.movies[index], ...res }
        },
        error: (err) => {
          console.log("unable to refresh")
        }
      }
    )
  }

  editMovie(index: number) {
    this.router.navigate(['/manage'], { queryParams: { id: this.movieControl[index].movieID } })
  }

  switchTrailer(i: number) {
    // Create a new array based on the current movieBool state
    this.movieControl = this.movieControl.map((item, index) => {
      if (index === i) {
        // For the clicked movie, update the values of 'main', 'trailer', and 'movie'
        return { ...item, main: false, trailer: true, movie: false };
      }
      return item;  // For all other movies, keep their values the same
    });
  }

  switchMovie(i: number) {
    this.movieControl = this.movieControl.map((item, index) => {
      if (index === i) {
        // For the clicked movie, update the values of 'main', 'trailer', and 'movie'
        return { ...item, main: false, trailer: false, movie: true };
      }
      return item;  // For all other movies, keep their values the same
    });
  }

  backHome(i: number) {
    this.movieControl = this.movieControl.map((item, index) => {
      if (index === i) {
        // For the clicked movie, update the values of 'main', 'trailer', and 'movie'
        return { ...item, main: true, trailer: false, movie: false };
      }
      return item;  // For all other movies, keep their values the same
    });
  }

}

interface MovieControl {
  movieID: string
  trailer: boolean,
  movie: boolean,
  main: boolean,
}