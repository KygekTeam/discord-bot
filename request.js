const request = require('request');
request('https://api.kygek.team/names', (error, response, body) => {
    const jsonArray = JSON.parse(body);
    jsonArray.forEach(name => {
        console.log(name);
    });
});