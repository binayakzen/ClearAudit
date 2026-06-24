require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all to serve the React app
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Simple Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
