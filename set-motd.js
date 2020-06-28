"use strict";

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
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
        let selection = null;
        if (process.argv.length == 3) {
            // Find the passed _id and select that quote.
            selection = await quotes.findOne({
                "_id": new mongo.ObjectId(process.argv[2].toString())
            });

            // Print the selection, because this mode is run on-demand.
            console.log(selection);
        } else {
            // Select a random quote.
            selection = await quotes.aggregate([
                { $match: {} },
                { $sample: { size: 1} }
            ]).next();
        }

        let formattedQuote = util.format("%s\n- %s\n\n", selection.quote, selection.speaker);
        await fsAsync.writeFile("/etc/motd.d/quote", formattedQuote, "utf8");
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

run();
