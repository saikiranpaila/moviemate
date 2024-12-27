import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../api/api.service';
import { Movie } from '../../../models/Movies';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchResults: Movie[] = [];
  query: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['query'];
      if (this.query) {
        this.performSearch(this.query);
      }
    });
  }

  performSearch(query: string): void {
    this.apiService.searchMovie(query).subscribe({
      next: (res: Movie[]) => { this.searchResults = res, console.log(res) },
      error: (err) => console.log("Unable to perform search")
    })
  }

}

