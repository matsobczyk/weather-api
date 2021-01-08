const express = require('express');
const app = express();
const http = require('http');
const validator = require('xsd-schema-validator');
require('dotenv').config();
const router = express.Router();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const xml2js = require('xml2js');

app.use(bodyParser.json());
app.use(morgan('combined'));


router.post("/", function (req, res, next) {
  const location = req.body.location;
  var apiLink= 'http://api.openweathermap.org/data/2.5/forecast?mode=xml&units=metric&lang=pl';
  apiLink += '&q=' + location;
  apiLink += '&appid=' + process.env.API_KEY;
  const now = new Date();
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
          if(err)
            res.status(500).json({ info: "Validation error 1"});
          if (result.valid){
            //przeksztalcenie na json
            xml2js.parseString(data, { mergeAttrs: true}, (err, result) => {
              if(err)
                throw err;

               var json = {
                  "location": result.weatherdata.location[0].name + '',
                  "time": now.getHours() + ':' + now.getMinutes(),
                  "day": now.getDay(),
                  "date": now.getDate() + '.' + now.getMonth()+1 + '.' + now.getFullYear(),
                  "temperature": result.weatherdata.forecast[0].time[0].temperature[0].value + ' ' + result.weatherdata.forecast[0].time[0].temperature[0].unit,
                  "windSpeed": result.weatherdata.forecast[0].time[0].windSpeed[0].mps + ' ' + result.weatherdata.forecast[0].time[0].windSpeed[0].unit,
                  "rainProbability": result.weatherdata.forecast[0].time[0].precipitation[0].probability + '',
                  "humidity": result.weatherdata.forecast[0].time[0].humidity[0].value + result.weatherdata.forecast[0].time[0].humidity[0].unit
              }
              
                res.status(200).json(json);
            });
          }
          else
            res.status(500).json({ info: "error"});
        });
        
      
      });
    }).on("error", (err) => {
    console.log("Error: " + err.message);
    res.status(500).json({ info: "error"});
    });
 
});

//test
router.get("/", (req, res, next)=> {
    res.status(200).json({ info: "test"})
});

app.use(router);
app.use((error, req, next)=> {
    res.status(error.status || 500).json({ info: error.message })
});

app.listen(3000);