const fetch = require('node-fetch');

function getStatusCode() {
  return fetch('https://google.com').then((res) => {
    console.log(res);
    return res.status;
  });
}
