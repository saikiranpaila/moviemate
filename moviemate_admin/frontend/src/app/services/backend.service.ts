import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Movie, MoviesResponse } from '../models/Movies';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  readonly url = 'http://localhost:3000'
  constructor(public http: HttpClient) { }
  getMovies() {
    const url = `${this.url}/api/v1/movies`
    return this.http.get<MoviesResponse>(url);
  }
  newMovie(body: any) {
    const url = `${this.url}/api/v1/movie`
    return this.http.post<Movie>(url, body);
  }
}
