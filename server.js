const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const PORT = process.env.PORT || 8080;

// Use history fallback for SPA routing
app.use(history());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});