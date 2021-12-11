const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');

var key = fs.readFileSync('./private/server.key');
var cert = fs.readFileSync('./private/server.crt');
var options = {
    key: key,
    cert: cert
};

app.use((_, res, next) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.use(express.static('../dist'));

const PORT = process.env.PORT || 8080;
var server = https.createServer(options, app);

server.listen(PORT, () => {
    console.log("server starting on port : " + PORT)
});

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}...`);
// });