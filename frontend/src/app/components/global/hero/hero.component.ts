import { Component, Input, ViewChild } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ApiService } from '../../../api/api.service';
import { Movie } from '../../../models/Movies';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Input() data!: Movie;

  @ViewChild('trailermodal') trailermodal!: ModalComponent;
  @ViewChild('moviemodal') moviemodal!: ModalComponent;

  constructor(private apiService: ApiService){}

  openTrailer() {
    this.trailermodal.openModal();
  }
  openMovie() {
    this.moviemodal.openModal()
  }
}