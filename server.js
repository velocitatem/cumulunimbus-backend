const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client: ServiceClient} = require('azure-iothub');
const { Message } = require('azure-iot-common');


app.use(bodyParser.json()); // support json encoded bodies
app.use(cors());



// azure iot hub connection
const connectionString = 'HostName=Cumulonimbus.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=70+uDUmL/oVHTnRMVTbLiJpNfeOwPPAoRAIoTHkXlc0=';
const clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
// Service client for Azure IoT Hub
const serviceClient = ServiceClient.fromConnectionString(connectionString);


// connect to azure iot hub


app.get('/status', (req, res) => {
    // chekc if the client is connected
    if (serviceClient) {
        res.send('connected');
    }
    else {
        res.send('not connected');
    }

});


app.post("/open/:id", async (req, res) => {
    // just log it for now
    const {state} = req.body;
    const deviceId = req.params.id;
    const command = state ? 'open' : 'close';
    // Create a message and send it to the IoT Hub for a specific device
    const message = new Message(JSON.stringify({ command }));
    try {
        await serviceClient.send(deviceId, message);
        res.send(`Command to ${command} sent to device ${deviceId}`);
    } catch (err) {
        console.error('Could not send message: ' + err.message);
        res.status(500).send('Failed to send message');
    }
});



app.get('/', (req, res) => {
    res.send('Hello World!');
});




const port = process.env.PORT || 3000;

const connectCallback = (err) => {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Client connected');

    }
};


const start = (callback) => {
    callback();
};



start(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}!`);
    });
})
