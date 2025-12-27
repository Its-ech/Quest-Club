const express = require('express');
const healthV1Routes = require('./routes/v1/health.routes');

const app = express();

app.use(express.json());
app.use('/api/v1', healthV1Routes);

module.exports = app;
