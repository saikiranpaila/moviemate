import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-manage-movie',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './manage-movie.component.html',
  styleUrl: './manage-movie.component.scss'
})
export class ManageMovieComponent {
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

  constructor(private backend: BackendService) { }

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
      this.movieGenres.setValue(this.convertGenresToArray(value), { emitEvent: false });
    });
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
      console.log(this.movieForm.value);
      this.backend.newMovie(this.movieForm.value).subscribe({
        next: (res: any) => {
          console.log("successfully pushed ", res)
        },
        error: (err: any) => {
          console.log("error ", err)
        }
      })
    } else {
      console.log('Form is invalid');
    }
  }
}