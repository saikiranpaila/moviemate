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

  @ViewChild('modal') modal!: ModalComponent;

  constructor(private apiService: ApiService) { }

  openTrailer(link: string, title: string, poster: string) {
    title = `${title} (Trailer)`
    this.modal.openModal(link, title, poster);
  }
  openMovie(link: string, title: string, poster: string) {
    this.modal.openModal(link, title, poster)
  }
}