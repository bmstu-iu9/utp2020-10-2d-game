const express = require('express')
const app = express();
var http = require('http').Server(app);

app.get('/', function(req, res) {
   res.sendfile('index.html');
});
app.use('/css', express.static(`${__dirname}/css`));

http.listen(3000, function() {
   console.log('listening on *:3000');
});
