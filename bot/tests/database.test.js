const { Client } = require('pg');
const database = require('../database.js');
const constants = require('../utils/constants.js');

jest.mock('pg');

describe('Database functions', () => {

    beforeEach(() => {

        config = {
            currencyPairs: ["BTC-USD", "ETH-USD", "XRP-USD"],
            fetchInterval: constants.DEFAULT_FETCH_INTERVAL,
            priceChangeThreshold: constants.DEFAULT_PRICE_CHANGE_THRESHOLD,
            lastAlertPrice: new Map()

        };

        mockClient = new Client();
        mockClient.connect = jest.fn();
        mockClient.query = jest.fn();
        Client.mockReturnValue(mockClient);

        console.log = jest.fn();
        
    });

    
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should correctly connect to the database', () => {
        
        database.connect();

        expect(mockClient.connect).toHaveBeenCalled();

    });

    test('Should correctly insert a currency pair', () => {
        
        database.insertCurrencyPair(mockClient, "BTC-USD");

        expect(mockClient.query).toHaveBeenCalledWith("INSERT INTO CurrencyPair (name) VALUES ($1) on conflict (name) do nothing;", ["BTC-USD"]);

    });

    test('Should correctly insert an alert', () => {
            
            mockClient.query.mockResolvedValue({rows: [{id: 1}]});
            database.insertAlert(mockClient, "BTC-USD", "2021-01-05T15:26:00.000Z", 26114.8290563242, config);
    
            expect(mockClient.query).toHaveBeenCalledWith("SELECT id FROM CurrencyPair WHERE name = $1;", ["BTC-USD"]);
    
    });
    
});