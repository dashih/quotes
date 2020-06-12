"use strict";

const MongoClient = require('mongodb').MongoClient;
const util = require('util');
const fsAsync = require('fs').promises;
const prompt = require("password-prompt");

const dbHost = Object.freeze("localhost:27017");
const dbUser = Object.freeze("quotes");
const db = Object.freeze("quotes");
const collection = Object.freeze("quotes");

async function run() {
    if (process.argv.length != 3) {
        console.error("Pass file for new quote.");
        return;
    }

    let newQuote = await fsAsync.readFile(process.argv[2], "utf8");
    let speaker = await prompt("Speaker: ");
    console.log(newQuote + "\n- " + speaker);
    let commit = await prompt("Commit? ");
    if (commit != "y") {
        console.log("User abort.");
        return;
    }

    let dbPassword = encodeURIComponent(await prompt("Password: "));
    let dbConn = Object.freeze(util.format(
        'mongodb://%s:%s@%s/%s',
        dbUser,
        dbPassword,
        dbHost,
        db));
    let client = await MongoClient.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true })
        .catch(connErr => {
            console.error(connErr);
        });
    if (client == null) {
        return;
    }

    try {
        let quotes = client.db(db).collection(collection);
        await quotes.insertOne({
            speaker: speaker,
            quote: newQuote
        });
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

run();
