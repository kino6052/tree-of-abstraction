const express = require('express');
const app = express();

app.listen(process.env.PORT);

app.use('/', express.static('static'));
app.use('/dependencies', express.static('bower_components'));