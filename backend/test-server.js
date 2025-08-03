const express = require('express');
const app = express();

console.log('Testing basic Express server...');

app.get('/', (req, res) => {
  res.send('Test server is working');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
