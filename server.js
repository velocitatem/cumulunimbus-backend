const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json()); // support json encoded bodies
app.use(cors());



// azure iot hub connection
const connectionString = 'HostName=Cumulonimbus.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=70+uDUmL/oVHTnRMVTbLiJpNfeOwPPAoRAIoTHkXlc0=';

// connect to azure iot hub


app.get('/status', (req, res) => {
    // chekc if the client is connected
    if (client.isOpen()) {
        res.send('Connected');
    }
    else {
        res.send('Not connected');
    }
});


app.post("/open/:id", (req, res) => {
    // just log it for now
    const {state} = req.body;
    const id = req.params.id;
    const st = state ? 'open' : 'close';
    console.log(`Received request to ${st} the door with id ${id}`);

    res.send('OK');
});



app.get('/', (req, res) => {
    res.send('Hello World!');
});




const port = process.env.PORT || 3000;
const start = (callback) => {
    callback()
};


start(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}!`);
    });
})
