import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { Movie } from '../../models/Movies';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  movies?: Movie[]
  constructor(private router: Router, private backend: BackendService) {
  }
  ngOnInit() {
    this.backend.getMovies().subscribe({
      next: (res) => {
        this.movies = res.result;
      },
      error: (err) => {
        console.log("error", err)
      }
    })
  }
  manageMovie() {
    this.router.navigate(['/manage'])
  }
}
