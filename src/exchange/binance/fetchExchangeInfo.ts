import { fetchJson } from '../../utils';

const BINANCE_USDM_EXCHANGE_INFO_URL = 'https://fapi.binance.com/fapi/v1/exchangeInfo';

export interface IBinanceExchangeInfo {
  symbols: {
    symbol: string;
    pair?: string; // only perp
    contractType?: 'PERPETUAL'; // only perp
    pricePrecision: number;
    quantityPrecision: number;
    baseAssetPrecision: number;
    quotePrecision: number;
    underlyingSubType: string[];
    deliveryDate: number;
    onboardData: number;
    status?: 'TRADING'; // only spot
  }[];
}

export async function fetchExchangeInfo(): Promise<IBinanceExchangeInfo['symbols']> {
  return (await fetchJson<IBinanceExchangeInfo>(BINANCE_USDM_EXCHANGE_INFO_URL))?.symbols || [];
}
