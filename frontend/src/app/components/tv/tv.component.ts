import { Component } from '@angular/core';
import { ApiService } from '../../api/api.service';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
  styleUrl: './tv.component.scss'
})
export class TvComponent {
  tv_data: any[] = [];
  tvCategories: { [key: string]: any[] } = {
    onTheAirTv: [],
    popularTv: [],
    airingTodayTv: [],
    topRatedTv: []
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadMovies();
    this.getTvDiscover(1);
  }

  loadMovies(): void {
    this.fetchMovies('popular', 'popularTv');
    this.fetchMovies('top_rated', 'topRatedTv');
    this.fetchMovies('on_the_air', 'onTheAirTv');
    this.fetchMovies('airing_today', 'airingTodayTv');
    
  }

  getTvDiscover(page: number) {
  this.apiService.getTvDiscover(page).subscribe(
    (res: any) => {
      this.tv_data = res.results.map((item: any) => {
        const tvItem = {
          ...item,
          link: `/tv/${item.id}`,
          videoId: '' // Initialize with an empty string
        };

        this.apiService.getYouTubeVideo(item.id, 'tv').subscribe(
          (videoRes: any) => {
            const video = videoRes.results.find((vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer');
            if (video) {
              tvItem.videoId = video.key; // Set the video key if available
            }
          },
          videoError => {
            console.error('Error fetching YouTube video for TV:', videoError);
          }
        );

        return tvItem;
      });
    },
    error => {
      console.error('Error fetching TV discover data', error);
    }
  );
}

  fetchMovies(category: string, property: string): void {
    this.apiService.getCategory(category, 1, 'tv')
      .subscribe(
        response => {
          this.tvCategories[property] = response.results.map((item: any) => ({
            link: `/tv/${item.id}`,
            imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
            title: item.name,
            rating: item.vote_average * 10,
            vote: item.vote_average
          }));
        },
        error => {
          console.error(`Error fetching ${category} movies:`, error);
        });
  }
}
