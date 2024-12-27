import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Movie, MoviesResponse } from '../models/Movies';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://api.themoviedb.org/3';
  private apiKey = 'dd4d819639705d332d531217b4f7c6b6';
  private language = 'en-US';
  private apiurl = environment.apiUrl + "/api/v1";

  constructor(private http: HttpClient) { }

  getMovies(page: number, perPage: number) {
    const url = `${this.apiurl}/movies?page=${page}&perPage=${perPage}`;
    return this.http.get<MoviesResponse>(url);
  }

  getMovieInfo(id: string) {
    const url = `${this.apiurl}/movies/${id}`;
    return this.http.get<Movie>(url);
  }

  searchMovie(pattern: string) {
    const url = `${this.apiurl}/search?pattern=${pattern}`
    return this.http.get<Movie[]>(url);
  }

}