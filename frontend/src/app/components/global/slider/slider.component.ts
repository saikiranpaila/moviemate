import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { ModalComponent } from '../modal/modal.component';
import { ApiService } from '../../../api/api.service';
import { MoviesResponse } from '../../../models/Movies';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SliderComponent implements OnInit, OnDestroy {
  @Input() data!: MoviesResponse;
  current = 0;
  private intervalId: any;
  @ViewChild('trailermodal') trailermodal!: ModalComponent;
  @ViewChild('moviemodal') moviemodal!: ModalComponent;

  constructor(private apiService: ApiService){}

  ngOnInit() {
    this.sliderTimer();
  }

  sliderTimer() {
    this.intervalId = setInterval(() => {
      this.current = (this.current + 1) % this.data.result.length;
    }, 500000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  openTrailer() {
    this.trailermodal.openModal();
  }
  openMovie() {
    this.moviemodal.openModal()
  }
}  