const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Movie = require('./models/Movie');
const MovieResponse = require('./utils/MovieResponse');
const { API_VERSION, API_PATH, MONGO_URI } = require('./config/config');
const Paged = require('./utils/Paged');

const app = express();
const port = 3000;

app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.post(`/${API_PATH}/${API_VERSION}/movies`, async (req, res) => {
    try {
        const movieData = req.body;
        const uuid = uuidv4();
        const md5Hash = crypto.createHash('md5').update(uuid).digest('hex');
        movieData.id = md5Hash
        const newMovie = new Movie(movieData);
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get(`/${API_PATH}/${API_VERSION}/movies`, async (req, res) => {
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

app.get(`/${API_PATH}/${API_VERSION}/movies/:id`, async (req, res) => {
    try {
        const { id } = req.params; // Get the custom ID from the URL parameter

        // Find the movie using the customId field (make sure `customId` is indexed in your schema)
        const movie = await Movie.findOne({ id: id });

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" }); // Return 404 if movie is not found
        }

        const formattedMovie = new MovieResponse(movie).toObject(); // Format the movie using MovieResponse class

        res.status(200).json(formattedMovie); // Return the formatted movie
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
});


// Route to get a movie by ID
app.post(`/${API_PATH}/${API_VERSION}/movies/:id`, async (req, res) => {
    try {
        // Extract the fields from the request body
        const updateData = req.body;

        // Ensure at least one field is provided in the body
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'At least one field must be provided to update' });
        }

        // Find the movie by custom 'id' and update only the fields provided in the body
        const updatedMovie = await Movie.findOneAndUpdate(
            { id: req.params.id },  // Use custom 'id' to find the movie
            updateData,              // Use the entire body as the update data
            { new: true }            // Return the updated document
        );

        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Format the updated movie document
        const response = new MovieResponse(updatedMovie);
        res.status(200).json(response.toObject());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
