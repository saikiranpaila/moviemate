const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Movie = require('./models/movie'); // Mongoose model
const MovieResponse = require('./utils/MovieResponse'); // Response class

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/moviemate')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.post('/movies', async (req, res) => {
    try {
        const movieData = req.body;
        const newMovie = new Movie(movieData);
        await newMovie.save();
        res.status(201).json(newMovie); // Send the formatted response
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/movies', async (req, res) => {
    try {
        const movies = await Movie.find();
        // To Response Object
        const formattedMovies = movies.map(movie => new MovieResponse(movie).toJSON());
        res.status(200).json(formattedMovies);
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
