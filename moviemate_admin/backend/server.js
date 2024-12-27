const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Movie = require('./models/Movie');
const MovieResponse = require('./utils/MovieResponse');
const { API_VERSION, API_PATH, MONGO_URI, REGION, SOURCE_BUCKET, JWT_SECRET_KEY, ADMIN_USER_ID, ADMIN_PASSWORD } = require('./config/config');
const Paged = require('./utils/Paged');
const authenticateJWT = require('./middleware/auth');
const User = require('./models/User');

const app = express();
const port = 3000;

app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const s3Client = new S3Client({
  region: REGION
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Create a new user
    const username = ADMIN_USER_ID; // Replace with the desired username
    const password = ADMIN_PASSWORD; // Replace with the desired password

    const user = await User.findOne({ username });

    if (user) {
      console.log("Admin user already exits");
    } else {
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new User document
      const newUser = new User({
        username,
        password: hashedPassword
      });

      // Save the user to the database
      await newUser.save();

      console.log(`Admin user created successfully`);
    }
  })
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post(`/${API_PATH}/${API_VERSION}/login`, async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)
  try {
    // Find the user by username/email
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare the password (assuming password is hashed)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: username }, `${JWT_SECRET_KEY}`, { expiresIn: '12h' });


    // Send the token as response
    res.status(200).json({ token });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


app.post(`/${API_PATH}/${API_VERSION}/movies`, authenticateJWT, async (req, res) => {
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

app.get(`/${API_PATH}/${API_VERSION}/movies`, authenticateJWT, async (req, res) => {
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

app.get(`/${API_PATH}/${API_VERSION}/movies/:id`, authenticateJWT, async (req, res) => {
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
app.post(`/${API_PATH}/${API_VERSION}/movies/:id`, authenticateJWT, async (req, res) => {
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
app.post(`/${API_PATH}/${API_VERSION}/generate-presigned-urls`, authenticateJWT, async (req, res) => {
  const { fileName, fileType, fileSize } = req.body;

  try {
    // Step 1: Create a multipart upload
    const createMultipartUploadParams = {
      Bucket: SOURCE_BUCKET,
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
        Bucket: SOURCE_BUCKET,
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
app.post(`/${API_PATH}/${API_VERSION}/complete-upload`, authenticateJWT, async (req, res) => {
  const { uploadId, fileName, parts } = req.body;

  try {
    // Step 3: Complete the multipart upload
    const completeParams = {
      Bucket: SOURCE_BUCKET,
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
app.post(`/${API_PATH}/${API_VERSION}/abort-upload`, authenticateJWT, async (req, res) => {
  const { uploadId, fileName } = req.body;

  try {
    const abortParams = {
      Bucket: SOURCE_BUCKET,
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
