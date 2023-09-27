# Uphold-Bot
Bot capable of alerting price oscillations of given currency pairs.

## Requirements
To run this bot, it is needed:
- Docker
- docker compose

In addition, two ```.env``` files are needed:
- ```.env-bot``` - containing the DATABASE_USER, the DATABASE_PASSWORD, the DATABASE_NAME, the DATABASE_HOST, and the DATABASE_PORT environment variables. It also includes the customized environment variables described in the following section.
- ```.env-database``` - containing the POSTGRES_USER, the POSTGRES_PASSWORD, and the POSTGRES_DB environment variables.

## Customization

The following customization is available:
- **Currency pairs** - definition of the currency pairs, according to the tag used at Uphold API, separated by commas.
	- **Example:** CURRENCY_PAIRS=BTC-USD,ETH-EUR
	- **Default Value:** BTC-USD 
- **Fetch interval** - definition of the interval, in seconds, for retrieving API data.
	-  **Example:** FETCH_INTERVAL=10
	- **Default Value:** 5
	- **Minimal Value:** 1
- **Price change threshold** - definition of the threshold, in percentage, for the price oscillation.
	-  **Example:** PRICE_CHANGE_THRESHOLD=0.5
	- **Default Value:** 0.01
	- **Minimal Value:** 0.0001

## Build the project
To build the necessary docker images, run the following command on the ```root``` of the project:
```
docker-compose build
```
## Run the project
After building the necessary docker images, run the following command on the ```root``` of the project to start the bot:
```
docker-compose up
```
## Stop the project
To stop the bot, run the following command on the ```root``` of the project:
```
docker-compose down
```

## Testing
To test the bot implementation, run the following command inside the ```bot``` folder:
```
npm test
```
## Notes
- Only the ask rate is considered to measure price oscillations.
- The bot notifies if the price oscillations are equal or greater than the price change threshold defined in each direction (i.e., when the price increases or decreases).