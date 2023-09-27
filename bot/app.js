const bot = require('./bot.js');
const database = require('./database.js');
const constants = require('./utils/constants.js');

// Run the application by parsing the arguments and then calling the alert function in loop
async function run(){
    let client = await database.connect();
    let config = parseArguments();
    for (const currencyPair of config.currencyPairs) {
        await database.insertCurrencyPair(client, currencyPair);
    }
    console.log("Running...");
    bot.alert(client, config);
    setInterval(() => bot.alert(client, config), config.fetchInterval);

}

// Parse the arguments passed to the application, creating the config object
function parseArguments() {

    let config = {};
    config.currencyPairs = (process.env.CURRENCY_PAIRS && process.env.CURRENCY_PAIRS.trim() || constants.DEFAULT_CURRENCY_PAIR).split(",");
    config.fetchInterval = (process.env.FETCH_INTERVAL && parseInt(process.env.FETCH_INTERVAL)) || constants.DEFAULT_FETCH_INTERVAL;
    config.fetchInterval = config.fetchInterval < constants.MIN_FETCH_INTERVAL ? constants.MIN_FETCH_INTERVAL : config.fetchInterval;
    config.priceChangeThreshold = (process.env.PRICE_CHANGE_THRESHOLD && parseFloat(process.env.PRICE_CHANGE_THRESHOLD)) || constants.DEFAULT_PRICE_CHANGE_THRESHOLD;
    config.priceChangeThreshold = config.priceChangeThreshold < constants.MIN_PRICE_CHANGE_THRESHOLD ? constants.MIN_PRICE_CHANGE_THRESHOLD : config.priceChangeThreshold;
    config.lastAlertPrice = new Map();
    
    return config;
    
}

run();