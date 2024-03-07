const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = express();

const DB = process.env.database
mongoose.connect(DB).then(() => console.log("DB Connection Successfull!!"));

app.get('/', (req, res) => {
    res.status(200).send('Welcome to HR-Manager');
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
