const express = require('express');
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;
const data = require('./data.json');

app.use(express.json({
  type: "*/*"
}));


// Add headers
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-Type", "application/json");
  next();
});


//Returns - unusable!
app.get('/api/get_all_versions', (req, res) => {
  res.send(data);
});

// Returns all the ids version!
app.get('/api/get_all_versions_id', (req, res) => {
  let op = data.map(function(item) {
    return item.id;
  });
  res.send(op.sort());
});

// Returns the specific version by id
app.get('/api/get_version/:id', (req, res) => {
  if(data.findIndex(t=>t.id == req.params.id)>-1){
    res.send(data.find(t=>t.id == req.params.id));
  }else{
    res.status(404);
    res.send("-1");
  }
});

// Deletes a version
app.delete('/api/delete_version/:id', (req, res) => {
  var removeUser = req.params.id;
  var data = fs.readFileSync('./data.json');
  var json = JSON.parse(data);
  json = json.filter((user) => { return user.id !== removeUser });
  fs.writeFileSync('./data.json', JSON.stringify(json, null, 2));
  res.send("deleted", 200);
});

// adds version
app.post('/api/add_version', jsonParser, function (req, res) {
  if(data.findIndex(t=>t.id == req.body.id)>-1){
    res.status(409);
    res.send('exists');
  }else{
    const date = new Date();
    let month = date.getUTCMonth()+1;
    let new_release = {
    "id": req.body.id,
    "author": req.body.author,
    "highlights": req.body.highlights,
    "features": req.body.features,
    "bug_fixes":  req.body.bug_fixes,
    "release_Date": date.getDate()+"/"+month+"/"+date.getUTCFullYear(),
  };

    var data1 = fs.readFileSync('./data.json');
    var json = JSON.parse(data1);
    json.push(new_release)
    fs.writeFileSync('./data.json', JSON.stringify(json, null, 2));
    res.status(201);
    res.send('done!');
  }
});

// update version
app.put('/api/update_version/:id', jsonParser, function (req, res) {
  if(data.findIndex(t=>t.id == req.params.id)>-1){
    let object = data.find(x => x.id === req.params.id);
    object.highlights = req.body.highlights;
    object.fetures = req.body.fetures;
    object.bug_fixes = req.body.bug_fixes;
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
    res.status(201);
    res.send("updated");
  }else{
    res.status(404);
    res.send("-1");
  }
});


app.listen(port, () => console.log(`Listening on port ${port}`));