const Movie = require('../models/Movie');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Middleware to verify the JWT token and get the user role
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Extract token from 'Authorization' header
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT Verification Error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Attach the user object to the request
    next();
  });
};

// Middleware to check if the user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Create a new movie (Admin only)
exports.createMovie = [authenticateToken, isAdmin, async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ message: 'Movie created successfully', movie });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}];

// Get all movies (Available for both users and admins)
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get movie by ID (Available for both users and admins)
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update movie (Admin only)
exports.updateMovie = [authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie updated', updatedMovie });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}];

// Delete movie (Admin only)
exports.deleteMovie = [authenticateToken, isAdmin, async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}];
