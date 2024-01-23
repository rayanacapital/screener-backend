import { tickersData, tradesCounter } from './tardis/runTardisStream';

const data: { tickers: { [key: string]: any } } = { tickers: {} };

export const getData = () => data;

const EMPTY_TICKS = {
  total: 0,
  sells: 0,
  buys: 0,
};

export const updateData = () => {
  const tickers5 = tradesCounter.getLastN(5);
  const tickers30 = tradesCounter.getLastN(30);
  const tickers60 = tradesCounter.getLastN(60);
  data.tickers = tickersData;
  for (const ticker of Object.keys(data.tickers)) {
    data.tickers[ticker].trades5 = tickers5[ticker] ? tickers5[ticker] : EMPTY_TICKS;
    data.tickers[ticker].trades30 = tickers30[ticker] ? tickers30[ticker] : EMPTY_TICKS;
    data.tickers[ticker].trades60 = tickers60[ticker] ? tickers60[ticker] : EMPTY_TICKS;
  }
};
