import { updateData } from './data';
import { IBinanceExchangeInfo, fetchExchangeInfo } from './exchange/binance/fetchExchangeInfo';
import { runTardisStream } from './tardis/runTardisStream';

// not the best looking ds, but as we anyway iterate full array all the time, it's ok
let binanceUsdmTickers: IBinanceExchangeInfo['symbols'] = [];
const updateBinancePerpTickers = async () => {
  const result = await fetchExchangeInfo();

  if (result.length > 0) {
    binanceUsdmTickers = result;

    runTardisStream(
      'binance-futures',
      binanceUsdmTickers.map((ticker) => ticker.symbol),
    );
  }
};
setInterval(updateBinancePerpTickers, 60_000);
updateBinancePerpTickers();

setInterval(updateData, 100);
