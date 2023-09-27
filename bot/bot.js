const axios = require("axios");
const constants = require('./utils/constants.js');
const database = require('./database.js');


// Get Currency pair price from Uphold API
async function getCurrencyPairPrice(currencyPair, config) {
    try {
        // Make request to Uphold API for the currency pair
        const response = await axios.get(constants.URL + currencyPair);
        return [response.headers.date, parseFloat(response.data["ask"])];
    } catch (error) {
        // Handle errors raised
        handleErrors(error.response.data.code, currencyPair, config);
    }
}

// Verify if there was a price variation greater than the threshold
function priceVariation(currentPrice, lastAlertPrice, priceChangeThreshold){
    return Math.abs(((lastAlertPrice - currentPrice)/lastAlertPrice*100).toFixed(constants.PRECISION_DIGITS)) >= priceChangeThreshold;
}

// Alert function responsible for fetching the price of each currency pair and printing the alert if necessary
async function alert(client, config){
    for (const currencyPair of config.currencyPairs) {
        getCurrencyPairPrice(currencyPair, config)
        .then(async ([timestamp, currentPrice]) => {
            if (!config.lastAlertPrice.has(currencyPair)){
                // It is the first time we fetch the price for this currency pair
                config.lastAlertPrice.set(currencyPair, currentPrice);
            }
            else if (priceVariation(currentPrice, config.lastAlertPrice.get(currencyPair), config.priceChangeThreshold)){
                // Price variation greater than the threshold, printing the alert and uodating the last alert price
                console.log("Alert! " + currencyPair + " price changed by " + config.priceChangeThreshold +  "%: from "
                 + config.lastAlertPrice.get(currencyPair) + " to " + currentPrice);
                await database.insertAlert(client, currencyPair, timestamp, currentPrice, config);
                // Update last alert price only after the alert being saved in the database
                config.lastAlertPrice.set(currencyPair, currentPrice);
            }
        
        });

    };
}

function handleErrors(error, currencyPair, config){
    switch (error) {
        case constants.NOT_FOUND:
            //currency pair not found
            console.log("Error: currency pair " + currencyPair + " not found");
            config.currencyPairs.splice(config.currencyPairs.indexOf(currencyPair), 1);
            config.lastAlertPrice.delete(currencyPair);
            break;
        case constants.TOO_MANY_REQUESTS:
            //too many requests
            console.log("Error: too many requests. Increasing fetch interval by 5 seconds");
            config.fetchInterval += constants.INCREASED_FETCH_INTERVAL;
            break;
        default:
            //unknown error
            console.error("Error", error);
            break;
    }
}


module.exports = {getCurrencyPairPrice, priceVariation, alert, handleErrors};


