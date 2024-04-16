const express = require('express'); // Import express
const fetch = require('node-fetch');

const app = express(); // Create express app

// Existing getStatusCode function
function getStatusCode() {
  return fetch('https://google.com').then((res) => {
    console.log(res);
    return res.status;
  });
}

// Healthcheck endpoint
app.get('/healthcheck', async (req, res) => {
  try {
    const status = await getStatusCode();
    // Check status and respond accordingly
    if (status >= 200 && status < 300) {
      res.status(200).send('OK');
    } else {
      res.status(500).send('External service unavailable');
    }
  } catch (error) {
    res.status(500).send('Error checking health');
  }
});

// ... rest of your application code

app.listen(3000, () => console.log('Server listening on port 3000!'));