const express = require('express');
const cors = require('cors');
const ttsRoute = require('./routes/tts');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 👉 Serve frontend files
app.use(express.static('public'));

// API route
app.use('/api/tts', ttsRoute);

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});