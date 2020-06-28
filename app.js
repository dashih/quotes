"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const MongoClient = require("mongodb").MongoClient;
const util = require("util");

const port = 8088;
const app = express();

const dbHost = Object.freeze("localhost:27017");
const dbUser = Object.freeze("quotes");
const db = Object.freeze("quotes");
const collection = Object.freeze("quotes");

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

http.createServer(app).listen(port);
