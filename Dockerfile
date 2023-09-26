FROM node:20

# Path: /app
WORKDIR /app

# Path: /app/package.json
COPY package.json .

# Install dependencies
RUN npm install

# Copy all files
COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start", "--currencyPairs='BTC-USD,ETH-EUR'", "--fetchInterval=5", "--priceChangeThreshold=0.01" ]