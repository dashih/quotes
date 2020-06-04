"use strict";

const MongoClient = require('mongodb').MongoClient;
const util = require('util');
const fsAsync = require('fs').promises;

const dbHost = Object.freeze("localhost:27017");
const dbUser = Object.freeze("quotesbackup");
const dbPassword = Object.freeze(encodeURIComponent("R9N6j2Zb#28oeTSZ9CqR5KH$X2cHjJfWyc7M@4EVgUv7T@yGR"));
const db = Object.freeze("quotes");
const collection = Object.freeze("quotes");
const dbConn = Object.freeze(util.format(
    'mongodb://%s:%s@%s/%s',
    dbUser,
    dbPassword,
    dbHost,
    db));

async function run() {
    let client = await MongoClient.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true })
        .catch(connErr => {
            console.error(connErr);
        });
    if (client == null) {
        return;
    }

    try {
        let quotes = client.db(db).collection(collection);
        let randomSelection = await quotes.aggregate([
            { $match: {} },
            { $sample: { size: 1} }
        ]).next();

        let formattedQuote = util.format("%s\n-%s\n\n", randomSelection.quote, randomSelection.speaker);
        await fsAsync.writeFile("/etc/motd.d/quote", formattedQuote, "utf8");
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

run();
