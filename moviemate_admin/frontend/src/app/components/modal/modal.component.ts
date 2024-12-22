import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalComponent {

  videoUrl!: string | undefined;
  posterUrl!: string | undefined;
  title!: string;
  isVisible = false;

  openModal(videoUrl: string, title: string, posterUrl: string = '') {
    this.videoUrl = videoUrl
    this.title = title
    this.posterUrl = posterUrl
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.videoUrl = '';
    this.posterUrl = '';
    this.title = '';
  }

}
