const axios = require("axios");
const config = require('./config.js');

// Get BTC price from Uphold API
async function getBTCPrice() {
    try {
        const response = await axios.get(config.url + config.currencyPair);
        return parseFloat(response.data["ask"]);
    } catch (error) {
        console.error(error);
    }
}

// Main function
async function main(){
    let lastPrice = null;
    while (true) {
        let currentPrice = await getBTCPrice();
        if (lastPrice === null) {
            lastPrice = currentPrice;
        }
        else if (lastPrice + config.priceChangeThreshold/100*lastPrice === currentPrice || lastPrice - config.priceChangeThreshold/100*lastPrice === currentPrice) {
            console.log("Alert! " + config.currencyPair + " price changed by " + config.priceChangeThreshold +  "%: from " + lastPrice + " to " + currentPrice);
            lastPrice = currentPrice;
        }
        await new Promise(resolve => setTimeout(resolve, config.timeOut));
    };
}

main();


