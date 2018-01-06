const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const jsonParser = bodyParser.json();

app.listen(process.env.PORT);
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use('/', express.static('static'));
app.use('/dependencies', express.static('bower_components'));
app.get('/getHierarchy', function (req, res) {
  var data = fs.readFileSync('./data/hierarchy.json', 'utf8');
  res.send(data);
});
app.post('/saveHierarchy', function(req, res){
    if (!req.body) return res.sendStatus(400);
    else {
        var data = req.body;
        fs.writeFileSync('./data/hierarchy-'+new Date().valueOf()+'.json', JSON.stringify(data));
        fs.writeFileSync('./data/hierarchy.json', JSON.stringify(data));
        res.send("Success");
    }
});
app.get('/getNotes', function (req, res) {
  var data = fs.readFileSync('./data/notes.json', 'utf8');
  res.send(data);
});
app.post('/saveNotes', function(req, res){
    if (!req.body) return res.sendStatus(400);
    else {
        var data = req.body;
        fs.writeFileSync('./data/notes-'+new Date().valueOf()+'.json', JSON.stringify(data));
        fs.writeFileSync('./data/notes.json', JSON.stringify(data));
        res.send("Success");
    }
});