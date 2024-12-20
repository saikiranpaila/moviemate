import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Movie } from '../../models/Movies';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-stream-update',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stream-update.component.html',
  styleUrl: './stream-update.component.scss'
})
export class StreamUpdateComponent implements OnInit {

  @Input({ alias: 'movieID', required: true }) movieID!: string
  @Input({ alias: 'trailer', required: true }) trailer!: boolean
  @Input({ alias: 'movie', required: true }) movie!: boolean
  @Output('back') back = new EventEmitter<boolean>();

  trailerURLFormControl: FormControl = new FormControl('')
  movieFormControl: FormControl = new FormControl('', Validators.required)
  trailerURLFormGroup!: FormGroup
  movieFormGroup!: FormGroup

  constructor(private backend: BackendService) { }

  ngOnInit(): void {
    this.trailerURLFormGroup = new FormGroup({
      trailerURL: this.trailerURLFormControl
    })
    this.movieFormGroup = new FormGroup({
      movie: this.movieFormControl
    })
  }

  backHome() {
    this.back.emit(true)
  }

  updateTrailerURL() {
    console.log(this.trailerURLFormGroup.value)
    this.backend.updateMovie({ id: this.movieID, trailer: this.trailerURLFormGroup.value.trailerURL })
  }

}
