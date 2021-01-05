const express = require('express');
const app = express();
const http = require('http');
require('dotenv').config();


var apiLink= 'http://api.openweathermap.org/data/2.5/forecast?mode=xml'
apiLink += '&q=London'
apiLink += '&appid='+process.env.API_KEY
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
    console.log(data);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

app.listen(3000);