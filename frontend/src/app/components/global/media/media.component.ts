import { Component, Input } from '@angular/core';
import { Movie } from '../../../models/Movies';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent {
  @Input() data!: Movie;
  print() {
    console.log(this.data)
  }
}
