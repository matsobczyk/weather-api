const express = require('express');
const app = express();
const http = require('http');
const validator = require('xsd-schema-validator');
require('dotenv').config();
const router = express.Router();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const xml2js = require('xml2js');
const { readSync } = require('fs');

app.use(bodyParser.json());
app.use(morgan('combined'));



router.post("/", (req, res, next)=> {
  const location = req.body.location;
  var apiLink= 'http://api.openweathermap.org/data/2.5/forecast?mode=xml';
  apiLink += '&q=' + location;
  apiLink += '&appid=' + process.env.API_KEY;
  console.log(apiLink);
  
// zapytanie pobierające dane od api pogodowego
  http.get(apiLink,
    (resp) => {
        let data=''
  // odebranie fragmentu danych
  resp.on('data', (chunk) => {
  data += chunk;
  });

  // odebranie całości danych
  resp.on('end', () => {
    //walidacja z xsd
    validator.validateXML(data, './resources/xsd.xsd', function(err, result) {
      if(err){
       // console.log(err);
        res.status(500).json({ info: "Validation error 1"});
      }
      if(result.valid){
        //konwercja data na json
        //https://attacomsian.com/blog/nodejs-convert-xml-to-json
        res.status(200).json({ info: data});
      }
      else
        res.status(500).json({ info: "Validation error 2"});
    });

  });
  }).on("error", (err) => {
  console.log("Error: " + err.message);
  res.status(500).json({ info: "error"});
  });
});


router.get("/", (req, res, next)=> {
    res.status(200).json({ info: "xd"})
});

app.use(router);
app.use((error, req, next)=> {
    res.status(error.status || 500).json({ wiadomość: error.message })
});

app.listen(3000);