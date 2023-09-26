const currencyPair = "BTC-USD";
const url = "https://api.uphold.com/v0/ticker/";
const priceChangeThreshold = 0.01; //percentage
const timeOut = 5000; //ms

module.exports = {currencyPair, url, priceChangeThreshold, timeOut};