const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Movie = require('./models/movie'); // Mongoose model
const MovieResponse = require('./utils/MovieResponse'); // Response class
const { API_VERSION, API_PATH, MONGO_URI } = require('./config/config');
const Paged = require('./utils/Paged');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.post(`/${API_VERSION}/${API_PATH}/movies`, async (req, res) => {
    try {
        const movieData = req.body;
        const newMovie = new Movie(movieData);
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get(`/${API_VERSION}/${API_PATH}/movies`, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const perPage = req.query.perPage || 10;
        const skip = (page - 1) * perPage;
        const [total, movies] = await Promise.all([Movie.countDocuments(), Movie.find().skip(skip).limit(perPage)]);
        const formattedMovies = movies.map(movie => new MovieResponse(movie).toObject());
        // To Response Object
        const paged = new Paged(page, formattedMovies, perPage, total)
        res.status(200).json(paged.toObject());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get a movie by ID
app.get('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Format the single movie document
        const response = new MovieResponse(movie);
        res.status(200).json(response.toJSON());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
