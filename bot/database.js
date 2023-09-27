const { Client } = require('pg');

async function connect(){

    //Initialize the client
    const client = new Client({
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
    });

    try {
        //Connect to the database
        await client.connect();
        console.log("Connected successfully!");
    } catch (error) {
        console.error("Connection error", error);
    }

    return client;
}

async function insertCurrencyPair(client, currencyPair){
    try {
        //Insert the currency pair
        await client.query("INSERT INTO CurrencyPair (name) VALUES ($1) on conflict (name) do nothing;", [currencyPair]);
    } catch (error) {
        console.error("Error inserting currency pair", error);
    }
}

async function insertAlert(client, currencyPair, timestamp, currentPrice, config){
    try {
        //get currencyPair id
        let response = await client.query("SELECT id FROM CurrencyPair WHERE name = $1;", [currencyPair]);
        let currencyPairId = response.rows[0].id;

        //Insert the alert
        await client.query("INSERT INTO Alert (currency_pair_id, time_stamp, old_price, new_price, config) VALUES ($1, $2, $3, $4, $5);",
        [currencyPairId, timestamp, config.lastAlertPrice.get(currencyPair), currentPrice, config]);
        console.log("Alert successfully saved in the database");

    } catch (error) {
        console.error("Error inserting alert", error);
    }
}

module.exports = { connect, insertCurrencyPair, insertAlert };
