import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Movie, MoviesResponse } from '../models/Movies';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  readonly url = environment.apiUrl
  constructor(private http: HttpClient) {
  }

  login(user: { username: string, password: string }) {
    const url = `${this.url}/api/v1/login`
    return this.http.post<{ token: string }>(url, user);
  }
  getMovies() {
    const url = `${this.url}/api/v1/movies`
    return this.http.get<MoviesResponse>(url);
  }
  getMovie(id: string) {
    const url = `${this.url}/api/v1/movies/${id}`
    return this.http.get<Movie>(url);
  }
  newMovie(body: any) {
    const url = `${this.url}/api/v1/movies`
    return this.http.post<Movie>(url, body);
  }
  updateMovie(movie: Movie) {
    const url = `${this.url}/api/v1/movies/${movie.id}`
    return this.http.post<Movie>(url, movie);
  }
  generatePresignedUrls(fileName: string, fileType: string, fileSize: number): Observable<any> {
    const body = { fileName, fileType, fileSize };
    return this.http.post<any>(`${this.url}/api/v1/generate-presigned-urls`, body);
  }

  completeUpload(uploadId: string, fileName: string, parts: any[]): Observable<any> {
    const body = { uploadId, fileName, parts };
    return this.http.post<any>(`${this.url}/api/v1/complete-upload`, body);
  }

  abortUpload(uploadId: string, fileName: string): Observable<any> {
    const body = { uploadId, fileName };
    return this.http.post<any>(`${this.url}/api/v1/abort-upload`, body)
  }
}
