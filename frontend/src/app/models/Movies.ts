export interface Movie {
  id: string;               // id is a required string
  title: string;            // title is a required string
  overview: string;        // overview is optional (not required in your schema)
  rating: number;          // rating is optional
  poster_path: string;     // poster_path is optional
  backdrop: string;        // backdrop is optional
  lang: string;            // lang is optional
  runtime: number;         // runtime is optional
  original_language: string; // original_language is optional
  genre: string[];         // genre is an optional array of strings
  release_date: Date;      // release_date is optional and a Date type
  vote_average: number;    // vote_average is optional
  vote_count: number;      // vote_count is optional
  trailer?: string;         // trailer is optional
  movie?: string;           // movie is optional
  processing?: boolean;     // processing is optional and a boolean
  status?: string;          // status is optional
}

export interface MoviesResponse {
  page: string;
  result: Movie[];
  totalPages: number;
  totalResults: number;
}
