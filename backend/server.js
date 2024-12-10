// Import the express module
const express = require('express');

// Create an instance of the Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define a sample in-memory data store (array of users)
const users = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com' }
];

// GET /users - Retrieve the list of users
app.get('/users', (req, res) => {
  res.json(users); // Respond with the users array as JSON
});

// GET /users/:id - Retrieve a specific user by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === userId);

  if (user) {
    res.json(user); // If found, return the user as JSON
  } else {
    res.status(404).json({ message: 'User not found' }); // Return 404 if not found
  }
});

// POST /users - Create a new user
app.post('/users', (req, res) => {
  const newUser = req.body; // Extract the user data from the request body
  newUser.id = users.length + 1; // Generate a new ID
  users.push(newUser); // Add the new user to the array

  res.status(201).json(newUser); // Respond with the created user and 201 status
});

// PUT /users/:id - Update an existing user by ID
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updatedUser = req.body;

  let user = users.find(u => u.id === userId);

  if (user) {
    user.name = updatedUser.name || user.name;
    user.email = updatedUser.email || user.email;

    res.json(user); // Return the updated user as JSON
  } else {
    res.status(404).json({ message: 'User not found' }); // Return 404 if user not found
  }
});

// DELETE /users/:id - Delete a user by ID
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);

  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    users.splice(index, 1); // Remove the user from the array
    res.status(204).end(); // Return 204 (No Content) for successful deletion
  } else {
    res.status(404).json({ message: 'User not found' }); // Return 404 if user not found
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
