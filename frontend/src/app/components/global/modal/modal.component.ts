import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input({required: true}) videoUrl!: string|undefined;
  @Input({required: false}) posterUrl!: string|undefined;
  @Input({required: true}) title!: string;
  isVisible = false;

  openModal() {
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.videoUrl = '';
  }

}
