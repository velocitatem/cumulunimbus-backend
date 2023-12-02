const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cosmos = require('@azure/cosmos');
const cors = require('cors');
const { Client: ServiceClient, Registry} = require('azure-iothub');
const { Message } = require('azure-iot-common');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
// import uuid
const { v4: uuidv4 } = require('uuid');


const uri = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



app.use(bodyParser.json()); // support json encoded bodies
app.use(cors());


// azure iot hub connection
const connectionString = process.env.AZK
const clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
// Service client for Azure IoT Hub
const serviceClient = ServiceClient.fromConnectionString(connectionString);
const registry = Registry.fromConnectionString(connectionString);


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
    const actionId = uuidv4();
    const command = state ? 'open' : 'close';
    // Create a message and send it to the IoT Hub for a specific device
    // csvlike
    let msgstr = `${actionId},${deviceId},${command}`;
    const message = new Message(msgstr);
    try {
        await serviceClient.send(deviceId, message);
        res.status(200).json({
            actionId,
        })
    } catch (err) {
        console.error('Could not send message: ' + err.message);
        res.status(500).send('Failed to send message');
    }
});


app.post("/acknowledge/:id", async (req, res) => {
    // just log it for now
    const {actionId} = req.body;
    const deviceId = req.params.id;
    const command = 'acknowledge';
    // connenct to mongodb
    await client.connect();
    const database = client.db('iot');
    const collection = database.collection('actions');

    // save id to db
    const result = await collection.insertOne({ actionId, deviceId, command });
    console.log(
        `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );
    res.status(200).json({
        actionId,
    })
});



app.get('/acknowledged/:id', async (req, res) => {
    // check if the action id is in the db
    const {id} = req.params;
    await client.connect();
    const database = client.db('iot');
    const collection = database.collection('actions');
    const query = { actionId: id };
    const result = await collection.findOne(query);
    if (result) {
        res.status(200).json({
            acknowledged: true,
        })
    }
    else {
        res.status(200).json({
            acknowledged: false,
        })
    }
});





app.get('/devices', async (req, res) => {
    registry.list((err, deviceList) => {
        if (err) {
            res.status(500).send('Error retrieving device list: ' + err.message);
        } else {
            const deviceIds = deviceList.map(device => device.deviceId);
            res.send(deviceIds);
        }
    });
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
