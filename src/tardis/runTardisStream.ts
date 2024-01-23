import { streamNormalized, normalizeTrades, normalizeBookChanges, Exchange, normalizeDerivativeTickers, combine, stream } from 'tardis-dev';
import { TicksCounter } from '../utils';

// track symbols, this is needed to spawn new tardis stream listener when new ticker is added
const runningSymbols = new Set();

export const tradesCounter = new TicksCounter();

// object is faster than map
export const tickersData: {
  [key: string]: {
    lastPrice: number;
    priceChange24hr: number;
    volume24hr: number;
    volumeBase24hr: number;
    trades24hr: number;
    openInterest: number;
  };
} = {};

export async function runTardisStream(exchange: Exchange, symbols: string[]) {
  const newSymbols = [];

  for (const symbol of symbols) {
    const key = `${exchange}-${symbol}`;
    if (!runningSymbols.has(key)) {
      newSymbols.push(symbol);
    }
    runningSymbols.add(key);

    if (newSymbols.length > 100) {
      runTardisStream(exchange, symbols);
    }
  }

  if (!newSymbols.length) {
    return;
  }

  const messages = combine(
    streamNormalized(
      {
        exchange,
        symbols: exchange.startsWith('binance') ? newSymbols.map((symbol) => symbol.toLocaleLowerCase()) : newSymbols,
      },
      normalizeTrades,
    ),
    stream({
      exchange,
      filters: [
        {
          channel: 'ticker',
          symbols: exchange.startsWith('binance') ? newSymbols.map((symbol) => symbol.toLocaleLowerCase()) : newSymbols,
        },
        {
          channel: 'openInterest',
          symbols: exchange.startsWith('binance') ? newSymbols.map((symbol) => symbol.toLocaleLowerCase()) : newSymbols,
        },
      ],
    }),
  );

  for await (const entry of messages) {
    const message = entry as any;
    if (message.type === 'trade') {
      tradesCounter.add(message.symbol, message.side);
    } else if (message?.message?.data?.e === '24hrTicker') {
      if (!tickersData[message.message.data.s]) {
        createTickersData(message.message.data.s);
      }
      // {
      //   "e":"24hrTicker",             // Event type
      //   "E":1591268262453,            // Event time
      //   "s":"BTCUSD_200626",          // Symbol
      //   "ps":"BTCUSD",                // Pair
      //   "p":"-43.4",                  // Price change
      //   "P":"-0.452",                 // Price change percent
      //   "w":"0.00147974",             // Weighted average price
      //   "c":"9548.5",                 // Last price
      //   "Q":"2",                      // Last quantity
      //   "o":"9591.9",                 // Open price
      //   "h":"10000.0",                // High price
      //   "l":"7000.0",                 // Low price
      //   "v":"487850",                 // Total traded volume
      //   "q":"32968676323.46222700",   // Total traded base asset volume
      //   "O":1591181820000,            // Statistics open time
      //   "C":1591268262442,            // Statistics close time
      //   "F":512014,                   // First trade ID
      //   "L":615289,                   // Last trade Id
      //   "n":103272                    // Total number of trades
      // }
      tickersData[message.message.data.s].lastPrice = parseFloat(message.message.data.c);
      tickersData[message.message.data.s].priceChange24hr = parseFloat(message.message.data.p);
      tickersData[message.message.data.s].volume24hr = parseFloat(message.message.data.v);
      tickersData[message.message.data.s].volumeBase24hr = parseFloat(message.message.data.q);
      tickersData[message.message.data.s].trades24hr = parseFloat(message.message.data.n);
    } else if (message?.message?.data?.openInterest) {
      if (!tickersData[message.message.data.symbol]) {
        createTickersData(message.message.data.symbol);
      }
      // {
      //   localTimestamp: 2024-01-23T04:16:31.949Z,
      //   message: {
      //     stream: 'bandusdt@openInterest',
      //     generated: true,
      //     data: {
      //       symbol: 'BANDUSDT',
      //       openInterest: '3653851.8',
      //       time: 1705983386198
      //     }
      //   }
      // }
      tickersData[message.message.data.symbol].openInterest = parseFloat(message?.message?.data?.openInterest);
    }
  }
}

function createTickersData(s: string) {
  tickersData[s] = {
    lastPrice: 0,
    priceChange24hr: 0,
    volume24hr: 0,
    volumeBase24hr: 0,
    trades24hr: 0,
    openInterest: 0,
  };
}
