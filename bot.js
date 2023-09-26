const axios = require("axios");
const constants = require('./constants.js');


// Get Currency pair price from Uphold API
async function getCurrencyPairPrice(currencyPair, config) {
    try {
        // Make request to Uphold API for the currency pair
        const response = await axios.get(constants.URL + currencyPair);
        return parseFloat(response.data["ask"]);
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
function alert(config){
    config.currencyPairs.forEach(currencyPair => {
        getCurrencyPairPrice(currencyPair, config)
        .then((currentPrice) => {
            if(!config.lastAlertPrice.has(currencyPair)){
                // It is the first time we fetch the price for this currency pair
                config.lastAlertPrice.set(currencyPair, currentPrice);
            }
            else if(priceVariation(currentPrice, config.lastAlertPrice.get(currencyPair), config.priceChangeThreshold)){
                // Price variation greater than the threshold, printing the alert
                console.log("Alert! " + currencyPair + " price changed by " + config.priceChangeThreshold +  "%: from "
                 + config.lastAlertPrice.get(currencyPair) + " to " + currentPrice);
                config.lastAlertPrice.set(currencyPair, currentPrice);
            }
        
        });

    });
}

// Run the application by parsing the arguments and then calling the alert function in loop
function run(){
    let config = parseArguments();
    console.log("Running...");
    alert(config);
    setInterval(() => alert(config), config.fetchInterval);

}

// Parse the arguments passed to the application, creating the config object
function parseArguments() {

    let config = {};
    config.currencyPairs = (process.env.npm_config_currencyPairs && process.env.npm_config_currencyPairs.trim() || constants.DEFAULT_CURRENCY_PAIR).split(",");
    config.fetchInterval = (process.env.npm_config_fetchInterval && parseInt(process.env.npm_config_fetchInterval)) || constants.DEFAULT_FETCH_INTERVAL;
    config.fetchInterval = config.fetchInterval < constants.MIN_FETCH_INTERVAL ? constants.MIN_FETCH_INTERVAL : config.fetchInterval;
    config.priceChangeThreshold = (process.env.npm_config_priceChangeThreshold && parseFloat(process.env.npm_config_priceChangeThreshold)) || constants.DEFAULT_PRICE_CHANGE_THRESHOLD;
    config.priceChangeThreshold = config.priceChangeThreshold < constants.MIN_PRICE_CHANGE_THRESHOLD ? constants.MIN_PRICE_CHANGE_THRESHOLD : config.priceChangeThreshold;
    config.lastAlertPrice = new Map();
    
    return config;
    
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
            console.log("Error: unknown error");
            break;
    }
}


module.exports = {run, parseArguments, alert, handleErrors};


