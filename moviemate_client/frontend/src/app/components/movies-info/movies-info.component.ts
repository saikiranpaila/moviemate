import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Movie } from '../../models/Movies';

@Component({
  selector: 'app-movies-info',
  templateUrl: './movies-info.component.html',
  styleUrls: ['./movies-info.component.scss']
})
export class MoviesInfoComponent implements OnInit {
  id!: string;
  movie_data!: Movie;
  activeTab: string = 'overview';
  recom_data: any[] = [];
  person_data: any;


  constructor(private apiService: ApiService, private router: ActivatedRoute) { }

  ngOnInit() {
    this.id = this.router.snapshot.paramMap.get('id')!;
    this.getMovieInfo(this.id);
  };

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getMovieInfo(id: string) {
    this.apiService.getMovieInfo(id).subscribe({
      next: (res: Movie) => { this.movie_data = res },
      error: (err) => { console.log("error ", err) }
    })
  }

}
