import { NgClass } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { BackendService } from '../../services/backend.service';
import { Movie } from '../../models/Movies';
import { ToastComponent } from '../toast/toast.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manage-movie',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, ToastComponent],
  templateUrl: './manage-movie.component.html',
  styleUrl: './manage-movie.component.scss'
})
export class ManageMovieComponent implements AfterViewInit {
  movieTitle!: FormControl;
  movieLang!: FormControl;
  movieRuntime!: FormControl;
  movieOverview!: FormControl;
  movieGenres!: FormControl;
  movieReleaseDate!: FormControl;
  movieRating!: FormControl;
  moviePoster!: FormControl;
  movieBackdrop!: FormControl;

  movieForm!: FormGroup;

  movieId: string = ''
  editing: boolean = false

  @ViewChild('toast') toast!: ToastComponent;

  constructor(private backend: BackendService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Initialize FormControls separately
    this.movieTitle = new FormControl('', Validators.required);
    this.movieLang = new FormControl('', Validators.required);
    this.movieRuntime = new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(300)
    ]);
    this.movieOverview = new FormControl('', Validators.required);
    this.movieGenres = new FormControl('', Validators.required);
    this.movieReleaseDate = new FormControl('', [
      Validators.required,
      this.validateDate
    ]);
    this.movieRating = new FormControl('', Validators.required);
    this.moviePoster = new FormControl('', [
      Validators.required,
      this.validateUrl
    ]);
    this.movieBackdrop = new FormControl('', [
      Validators.required,
      this.validateUrl
    ]);

    // Now initialize FormGroup using the FormControl instances
    this.movieForm = new FormGroup({
      title: this.movieTitle,
      overview: this.movieOverview,
      rating: this.movieRating,
      poster_path: this.moviePoster,
      backdrop: this.movieBackdrop,
      lang: this.movieLang,
      runtime: this.movieRuntime,
      genres: this.movieGenres,
      release_date: this.movieReleaseDate,
    });
    // Listen for changes in the movieGenre FormControl and convert the input string to an array
    this.movieGenres.valueChanges.subscribe(value => {
      // Convert the comma-separated string into an array
      if (Array.isArray(value)) return
      this.movieGenres.setValue(this.convertGenresToArray(value), { emitEvent: false });
    });
  }

  ngAfterViewInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.movieForm.disable()
        this.movieId = params['id'];
        this.editing = true
        this.backend.getMovie(this.movieId).subscribe({
          next: (res: Movie) => {// Populate form fields
            this.movieTitle.setValue(res.title || '');
            this.movieLang.setValue(res.lang || '');
            this.movieRuntime.setValue(res.runtime || '');
            this.movieOverview.setValue(res.overview || '');
            const genres = res.genres?.join(', ')
            this.movieGenres.setValue(genres || '');
            this.movieReleaseDate.setValue(this.formatDate(res?.release_date?.toString() || ''));
            this.movieRating.setValue(res.rating || '');
            this.moviePoster.setValue(res.poster_path || '');
            this.movieBackdrop.setValue(res.backdrop || '');
            this.movieForm.enable()
          },
          error: (err) => {
            this.toast.showToast("Unable to find the movie", false)
          }
        })
      }
    })
  }

  formatDate(inputDate: string) {
    if (inputDate == '') return ''
    // Split the input date string by "/"
    const [day, month, year] = inputDate.split('/');

    // Pad day and month to ensure they are two digits
    const formattedDay = day.padStart(2, '0');
    const formattedMonth = month.padStart(2, '0');

    // Return the formatted date in "MM-DD-YYYY" format
    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  // Convert comma-separated genres into an array
  convertGenresToArray(value: string): string[] {
    if (!value) return [];
    // Split the input by commas and remove any extra spaces from each genre
    return value.split(',').map(genre => genre);
  }

  // Custom date validator
  validateDate(control: FormControl): { [key: string]: boolean } | null {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(control.value)) {
      return { 'invalidDate': true };
    }
    return null;
  }

  // Custom URL validator
  validateUrl(control: FormControl): { [key: string]: boolean } | null {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\S*)$/;
    if (!regex.test(control.value)) {
      return { 'invalidUrl': true };
    }
    return null;
  }

  onSubmit() {
    if (this.movieForm.valid) {
      this.movieForm.value.genres = this.movieForm.value.genres.map((genre: string) => genre.trim());
      if (!this.editing) {
        this.backend.newMovie(this.movieForm.value).subscribe({
          next: (res: Movie) => {
            console.log("successfully pushed ", res)
            this.toast.showToast("Movie Pushed", true)
          },
          error: (err: any) => {
            console.log("error ", err)
            this.toast.showToast("Unable to push Movie", false)
          }
        })
      } else {
        const movie = this.movieForm.value
        movie.id = this.movieId
        this.backend.updateMovie(movie).subscribe({
          next: (res: Movie) => {
            this.toast.showToast("Movie Updated", true)
          },
          error: (err) => {
            this.toast.showToast("Unable to update Movie", false)
          }
        })
      }
    } else {
      console.log('Form is invalid');
    }
  }

  home() {
    this.router.navigate(['/'])
  }

}