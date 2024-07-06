require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const friend = require('./routes/friend');
const trip = require('./routes/trip');
const chat = require('./routes/chat');
const aichat = require('./routes/aichat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Add this line to enable CORS

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friend', friend);
app.use('/api/trip', trip);
app.use('/api/chat', chat);
app.use('/api/aiChat', aichat);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
