"use strict";

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const MongoClient = require("mongodb").MongoClient;
const util = require("util");
const execAsync = util.promisify(require("child_process").exec);

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const port = config["port"];
const dbHost = config["dbHost"];
const dbUser = config["dbReadWriteUser"];
const dbPassword = encodeURIComponent(config["dbReadWritePassword"]);
const db = config["db"];
const collection = config["db"];

const app = express();

app.use(express.static("client"));
app.use(bodyParser.json());

app.post("/submit", async (req, res) => {
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

        await execAsync("sudo node set-motd.js " + ret.insertedId);

        res.send({ newId: ret.insertedId });
    } catch (err) {
        res.status(500).send(err);
    } finally {
        client.close();
    }
});

http.createServer(app).listen(port);
