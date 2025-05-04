const express = require('express');
const mongoose = require('mongoose');
const movieRoutes = require('./routes/movieRoutes');
const app = express();

app.use(express.json());
app.use('/api/movies', movieRoutes);

mongoose.connect(process.env.MONGO_URL||'mongodb://localhost:27017/movieservice', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(3001, () => {
    console.log('Movie service running on port 3001');
  });
}).catch(err => console.error(err));
