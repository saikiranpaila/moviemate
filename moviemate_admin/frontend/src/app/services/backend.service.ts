import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  readonly url = 'http://localhost:3000'
  constructor(public http: HttpClient) { }
  newMovie(body: any) {
    const url = `${this.url}/api/v1/movie`
    return this.http.post(url, body);
  }
}
