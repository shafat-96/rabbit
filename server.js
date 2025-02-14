const express = require('express');
const cors = require('cors');
const embedHandler = require('./api/embed');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/embed', (req, res) => embedHandler(req, res));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 