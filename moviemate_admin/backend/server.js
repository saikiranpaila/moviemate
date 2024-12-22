const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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

// AWS Configuration
const REGION = 'us-east-1'; // E.g. 'us-east-1'
const BUCKET_NAME = 'srcbucket-13122024';
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: 'AKIAXYKJVSPD3XOJWQAZ',  // Load AWS credentials from environment variables
    secretAccessKey: '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'
  }
});

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

    // Find the movie using the id
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

// Route to generate pre-signed URLs
app.post(`/${API_PATH}/${API_VERSION}/generate-presigned-urls`, async (req, res) => {
  const { fileName, fileType, fileSize } = req.body;

  try {
    // Step 1: Create a multipart upload
    const createMultipartUploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    };
    const createMultipartUploadCommand = new CreateMultipartUploadCommand(createMultipartUploadParams);
    const createMultipartUploadResponse = await s3Client.send(createMultipartUploadCommand);

    const uploadId = createMultipartUploadResponse.UploadId;

    // Step 2: Generate pre-signed URLs for each part
    const parts = Math.ceil(fileSize / (100 * 1024 * 1024)); // 100MB per part
    const presignedUrls = [];

    for (let partNumber = 1; partNumber <= parts; partNumber++) {
      const uploadPartParams = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        PartNumber: partNumber,
        UploadId: uploadId,
      };

      const presignedUrl = await getSignedUrl(s3Client, new UploadPartCommand(uploadPartParams), { expiresIn: 3600 });
      presignedUrls.push({ partNumber, presignedUrl });
    }

    res.json({
      uploadId,
      presignedUrls
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error generating pre-signed URLs" });
  }
});

// Route to complete the multipart upload
app.post(`/${API_PATH}/${API_VERSION}/complete-upload`, async (req, res) => {
  const { uploadId, fileName, parts } = req.body;

  try {
    // Step 3: Complete the multipart upload
    const completeParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(part => ({
          ETag: part.etag, // You'll need to collect the ETag for each part after uploading it.
          PartNumber: part.partNumber
        })),
      },
    };

    const completeCommand = new CompleteMultipartUploadCommand(completeParams);
    const completeResponse = await s3Client.send(completeCommand);

    res.json(completeResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error completing upload" });
  }
});

// Route to abort the multipart upload 
app.post(`/${API_PATH}/${API_VERSION}/abort-upload`, async (req, res) => {
  const { uploadId, fileName } = req.body;

  try {
    const abortParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      UploadId: uploadId,
    };

    const abortCommand = new AbortMultipartUploadCommand(abortParams);
    await s3Client.send(abortCommand);

    res.send({ message: "Upload aborted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error aborting upload" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
