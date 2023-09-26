//test the bot methods
const bot = require('./bot.js');
const axios = require('axios');
const constants = require('./constants.js');

jest.mock('axios');

describe('Bot functions', () => {

    beforeEach(() => {

        config = {
            currencyPairs: ["BTC-USD", "ETH-USD", "XRP-USD"],
            fetchInterval: constants.DEFAULT_FETCH_INTERVAL,
            priceChangeThreshold: constants.DEFAULT_PRICE_CHANGE_THRESHOLD,
            lastAlertPrice: new Map()

        };

        mockResponse = {data: {ask: "26114.8290563242", bid: "26042.3380987695", currency: "USD"}};
    });

    
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should call axios.get correctly', () => {
        
        axios.get.mockResolvedValue(mockResponse);
        bot.alert(config);
        
        expect(axios.get).toHaveBeenCalledTimes(config.currencyPairs.length);

        config.currencyPairs.forEach(currencyPair => {
            expect(axios.get).toHaveBeenCalledWith(constants.URL + currencyPair);
        });

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

