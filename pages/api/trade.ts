// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
interface TradeI  { 
  getTradeData(): Promise<TradeData>
  fetchTrade(minProfitibility: number , maxProfitibility: number ): Promise<Arbitrage[]>
}


export interface Trade {
  ticker: string;
  exchange: string;
  price: number;
}

export interface TradePath {
  trades: Trade[];
  profitability: number;
}

export interface TradeData {
  [ticker: string]: {
    [exchange: string]: number;
  };
}

export interface ArbitrageOpportunity {
  buy: Trade;
  sell: Trade;
  profitability: number;
}

export interface Arbitrage {
    highest: { exchange: string; price: number };
    lowest: { exchange: string; price: number };
  profitability: number
  ticker: string
}



type Data = {
  data: Arbitrage[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
): Promise<any> {

  const tradeInstance = new TradeModule()

  const arbitrage = await tradeInstance.fetchTrade()

  res.status(200).json({ data: arbitrage })

  return
}


class TradeModule implements TradeI {
  async getTradeData(): Promise<TradeData> {
    const [kucoinRes, huobiRes, binanceRes] = await Promise.all([
      axios.get('https://api.kucoin.com/api/v1/market/allTickers'),
      axios.get('https://api.huobi.pro/market/tickers'),
      axios.get('  http://api.scraperapi.com/?api_key=49fff32733b0143bec8029dd3f4c01d5&url=https://api.coingecko.com/api/v3/exchanges/binance/tickers'),
  
    ]);
  
    let binanceData = binanceRes.data.tickers.reduce((data: TradeData, ticker: any) => {
      if (ticker.target.toLowerCase() === 'usdt') {
        data[ticker.base] = {
          binance: parseFloat(ticker.last),
        };
      }
      return data;
    }, {});
  
  
    let huobiData = huobiRes.data.data.reduce((data: TradeData, ticker: any) => {
      if (ticker.symbol.toLowerCase().endsWith('usdt')) {
        data[ticker.symbol.slice(0, -4).toUpperCase()] = {
          huobi: parseFloat(ticker.close),
        };
      }
      return data;
    }, {});
  
    let kucoinData = kucoinRes.data.data.ticker.reduce((data: TradeData, ticker: any) => {
      if (ticker.symbol.endsWith('-USDT') && ticker.last !== null) {
        data[ticker.symbol.slice(0, -5).toUpperCase()] = {
          kucoin: parseFloat(ticker.last),
        };
      }
      return data;
    }, {});

  
  
    const tradeData: TradeData = {};
    for (const exchangeData of [ huobiData, kucoinData, binanceData]) {
      for (const ticker in exchangeData) {
        if (tradeData[ticker] === undefined) {
          tradeData[ticker] = {};
        }
        for (const exchange in exchangeData[ticker]) {
          tradeData[ticker][exchange] = exchangeData[ticker][exchange];
        }
      }
    }
  
    for(const ticker in tradeData) {
      if(Object.keys(tradeData[ticker]).length < 3) delete tradeData[ticker]
    }
    return tradeData;
  }

  async fetchTrade(minProfitibility: number = 15, maxProfitibility: number = 55): Promise<Arbitrage[]> {
    const tradeData = await this.getTradeData();
    const arbitrageOpportunities: Arbitrage[] = [];
  
    for (const ticker in tradeData) {
      const exchanges = Object.keys(tradeData[ticker]);
      if (exchanges.length < 2) {
        continue;
      }
  
      for (let i = 0; i < exchanges.length - 1; i++) {
        for (let j = i + 1; j < exchanges.length; j++) {
  
          const priceA = tradeData[ticker][exchangeA];
          const priceB = tradeData[ticker][exchangeB];
  
          if (priceA && priceB) {
            const profitability = (priceB / priceA - 1) * 100;
  
            if (profitability < minProfitibility || profitability > maxProfitibility) {
              continue;
            }
  
            const minProfit = priceA * 0.1;
            if (priceB < minProfit + priceA) {
              continue;
            }
  
            const highest = priceA > priceB ? { exchange: exchangeA, price: priceA } : { exchange: exchangeB, price: priceB };
            const lowest = priceA > priceB ? { exchange: exchangeB, price: priceB } : { exchange: exchangeA, price: priceA };
            arbitrageOpportunities.push({
              highest,
              lowest,
              profitability,
              ticker,
            });
          }
        }
      }
    }
  
    return arbitrageOpportunities;
  }
  
}

