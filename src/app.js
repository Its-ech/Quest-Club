const express = require('express');
const V1Routes = require('./routes/v1');
const { notFound, errorHandler } = require('./middlewares/errorHandlers');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', V1Routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
