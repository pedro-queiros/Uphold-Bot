const bot = require('../bot.js');
const axios = require('axios');
const constants = require('../utils/constants.js');

jest.mock('axios');

describe('Bot functions', () => {

    beforeEach(() => {

        config = {
            currencyPairs: ["BTC-USD", "ETH-USD", "XRP-USD"],
            fetchInterval: constants.DEFAULT_FETCH_INTERVAL,
            priceChangeThreshold: constants.DEFAULT_PRICE_CHANGE_THRESHOLD,
            lastAlertPrice: new Map()

        };

        config.lastAlertPrice.set("BTC-USD", 26120.8290563243);

        mockResponse = {
            data: {ask: "26114.8290563242", bid: "26042.3380987695", currency: "USD"},
            headers: { date: 'Wed, 27 Sept 2023 16:28:00 GMT' }
        };

        console.log = jest.fn();
    });

    
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should call axios.get correctly', () => {
        
        axios.get.mockResolvedValue(mockResponse);
        bot.alert(null, config);
        
        expect(axios.get).toHaveBeenCalledTimes(config.currencyPairs.length);

        for (const currencyPair of config.currencyPairs) {
            expect(axios.get).toHaveBeenCalledWith(constants.URL + currencyPair);
        }

    });

    test('Recognize price variation greater than the threshold', () => {
            
            axios.get.mockResolvedValue(mockResponse);
            expect(bot.priceVariation(26114.8290563242, config.lastAlertPrice.get("BTC-USD"), config.priceChangeThreshold)).toBe(true);
            expect(bot.priceVariation(26120.8290563243, config.lastAlertPrice.get("BTC-USD"), config.priceChangeThreshold)).toBe(false);
    
    });

    test('Handle currency pair not found error', () => {
        
        axios.get.mockResolvedValue(mockResponse);
        bot.handleErrors(constants.NOT_FOUND, "BTC-USD", config);
        expect(config.currencyPairs.length).toBe(2);
        expect(config.currencyPairs).toEqual(["ETH-USD", "XRP-USD"]);

    });

    test('Handle too many requests error', () => {
        
        axios.get.mockResolvedValue(mockResponse);
        bot.handleErrors(constants.TOO_MANY_REQUESTS, "BTC-USD", config);
        expect(config.fetchInterval).toEqual(constants.DEFAULT_FETCH_INTERVAL + constants.INCREASED_FETCH_INTERVAL);

    });
    
});

