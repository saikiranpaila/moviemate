class MovieResponse {
    constructor(movieData) {
        this.id = movieData.id;
        this.title = movieData.title;
        this.overview = movieData.overview;
        this.poster_path = movieData.poster_path;
        this.original_language = movieData.original_language;
        this.genre_ids = movieData.genre_ids;
        this.release_date = movieData.release_date;
        this.vote_average = movieData.vote_average;
        this.vote_count = movieData.vote_count;
    }

    // Example of method that can add additional logic or formatting
    getFormattedReleaseDate() {
        return new Date(this.release_date).toLocaleDateString();
    }

    // Format the response to the desired structure
    toObject() {
        return {
            id: this.id,
            title: this.title,
            overview: this.overview,
            poster_path: this.poster_path,
            original_language: this.original_language,
            genre_ids: this.genre_ids,
            release_date: this.getFormattedReleaseDate(),
            vote_average: this.vote_average,
            vote_count: this.vote_count
        };
    }
}

module.exports = MovieResponse;
