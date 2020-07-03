"use strict";

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const MongoClient = require("mongodb").MongoClient;
const util = require("util");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const port = config["port"];
const dbHost = config["dbHost"];
const dbUser = config["dbReadWriteUser"];
const db = config["db"];
const collection = config["db"];
const httpsOptions = {
    key: fs.readFileSync(config['sslKeyFile']),
    cert: fs.readFileSync(config['sslCertFile']),
    ca: fs.readFileSync(config['sslCaFile'])
};

const app = express();

app.use(express.static("client"));
app.use(bodyParser.json());

app.post("/submit", async (req, res) => {
    let dbPassword = encodeURIComponent(req.body.password);
    let speaker = req.body.speaker;
    let quote = req.body.quote;

    let dbConn = Object.freeze(util.format(
        'mongodb://%s:%s@%s/%s',
        dbUser,
        dbPassword,
        dbHost,
        db));
    let client = await MongoClient.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true })
        .catch(connErr => {
            res.status(500).send(connErr);
            console.error(connErr);
            return;
        });
    if (client == null) {
        return;
    }

    try {
        let quotes = client.db(db).collection(collection);
        let ret = await quotes.insertOne({
            speaker: speaker,
            quote: quote
        });

        res.send({ newId: ret.insertedId });
    } catch (err) {
        res.status(500).send(err);
    } finally {
        client.close();
    }
});

https.createServer(httpsOptions, app).listen(port);
