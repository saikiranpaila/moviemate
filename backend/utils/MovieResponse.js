class MovieResponse {
    constructor(movieData) {
        this.id = movieData.id;
        this.title = movieData.title;
        this.overview = movieData.overview || '';  // Default empty string if not available
        this.rating = movieData.rating || null;  // Default null if not available
        this.poster_path = movieData.poster_path || '';  // Default empty string if not available
        this.backdrop = movieData.backdrop || '';  // Default empty string if not available
        this.lang = movieData.lang || '';  // Default empty string if not available
        this.runtime = movieData.runtime || null;  // Default null if not available
        this.genre_ids = movieData.genre_ids || [];  // Default empty array if not available
        this.release_date = movieData.release_date || null;  // Default null if not available
        this.trailer = movieData.trailer || '';  // Default empty string if not available
        this.movie = movieData.movie || '';  // Default empty string if not available
        this.processing = movieData.processing || false;  // Default false if not available
        this.status = movieData.status || '';  // Default empty string if not available
    }

    // Example of method that can add additional logic or formatting
    getFormattedReleaseDate() {
        return this.release_date ? new Date(this.release_date).toLocaleDateString() : 'N/A';
    }

    // Format the response to the desired structure
    toObject() {
        return {
            id: this.id,
            title: this.title,
            overview: this.overview,
            rating: this.rating,
            poster_path: this.poster_path,
            backdrop: this.backdrop,
            lang: this.lang,
            runtime: this.runtime,
            genre_ids: this.genre_ids,
            release_date: this.getFormattedReleaseDate(),
            trailer: this.trailer,
            movie: this.movie,
            processing: this.processing,
            status: this.status
        };
    }
}

module.exports = MovieResponse;