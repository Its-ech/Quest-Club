const express = require('express');
const healthV1Routes = require('./routes/v1');
const { notFound, errorHandler } = require('./middlewares/errorHandlers');


const app = express();

app.use(express.json());
app.use('/api/v1', healthV1Routes);

app.use(notFound);
app.use(errorHandler);
module.exports = app;
