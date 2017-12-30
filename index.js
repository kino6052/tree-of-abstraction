const express = require('express');
const app = express();

app.listen(process.env.PORT);

app.use('/', express.static('static'));