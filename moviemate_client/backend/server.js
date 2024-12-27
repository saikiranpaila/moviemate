const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')
const Movie = require('./models/Movie');
const MovieResponse = require('./utils/MovieResponse');
const { API_VERSION, API_PATH, MONGO_URI } = require('./config/config');
const Paged = require('./utils/Paged');

const app = express();
const port = 3000;

app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
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


// Start the server
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
