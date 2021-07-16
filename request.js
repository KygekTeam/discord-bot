const request = require('request');
request('https://api.kygekteam.org/names', (error, response, body) => {
    const jsonArray = JSON.parse(body);
    jsonArray.forEach(name => {
        console.log(name);
    });
});