const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './../.env' });

const app = express();

app.get('/', (req, res) => {
    res.status(200).send('Hello from HR-Manager');
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
