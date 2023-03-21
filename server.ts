// Import required modules
const express = require('express');
const next = require('next');
const cors = require('cors');

// type ArbitrageOpportunity = {
//   currency: string;
//   buyExchange: string;
//   sellExchange: string;
//   buyPrice: number;
//   sellPrice: number;
//   spread: number;
// };

async function getExchangePrice(exchange, currency) {
  const apis = {
    binance: 'https://api.binance.com/api/v3/ticker/price',
    coinbase: 'https://api.pro.coinbase.com/products',
    kraken: 'https://api.kraken.com/0/public/Ticker',
    // add more exchange APIs here
  };

  if (exchange in apis) {
    const api = apis[exchange];
    const response = await fetch(`${api}/${currency}`);
    const json = await response.json();

    switch (exchange) {
      case 'binance':
        return parseFloat(json.price);
      case 'coinbase':
        return parseFloat(json[0].price);
      case 'kraken':
        return parseFloat(json.result[`${currency}USDT`].c[0]);
      // handle responses from other exchanges
    }
  }

  throw new Error(`Exchange '${exchange}' not supported`);
}

async function getArbitrageOpportunities() {
  const currencies = ['btc', 'eth', 'xrp', 'ltc', 'bch', 'ada', 'dot', 'link'];
  const exchanges = ['binance', 'coinbase', 'kraken'];
  const opportunities = [];

  for (let i = 0; i < currencies.length; i++) {
    const currency = currencies[i];

    for (let j = 0; j < exchanges.length; j++) {
      const exchange = exchanges[j];

      try {
        const price = await getExchangePrice(exchange, currency);

        for (let k = j + 1; k < exchanges.length; k++) {
          const secondExchange = exchanges[k];

          try {
            const secondPrice = await getExchangePrice(secondExchange, currency);

            const profitability = ((secondPrice - price) / price) * 100;

            if (profitability > 0) {
              opportunities.push({
                trades: [
                  { ticker: currency.toUpperCase(), exchange, price },
                  { ticker: currency.toUpperCase(), exchange: secondExchange, price: secondPrice },
                ],
                profitability,
              });
            }
          } catch (error) {
            console.error(error.message);
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    }
  }

  return opportunities;
}


// Initialize Next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize Express server
const server = express();

const corsMiddleware = cors({
  origin: 'http://localhost:3000', // Replace with your domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
});


// Define server routes
server.get('/api/arbitrage', async (req, res) => {
  // Get required parameters from request query string
  // await corsMiddleware(req, res);
  // Call the arbitrage algorithm to get opportunities
  const opportunities = await getArbitrageOpportunities();

  // Return the opportunities as response
  res.status(200).json(opportunities);
});

// Handle Next.js requests
app.prepare().then(() => {
  server.get('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server
  const port = process.env.PORT || 4000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});