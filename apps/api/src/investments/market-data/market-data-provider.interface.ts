import { AssetDetail } from '@nova-bank/types';

export interface MarketDataProvider {
  getAsset(symbol: string, exchange?: string): Promise<AssetDetail | null>;
  getAssets(symbols: string[]): Promise<AssetDetail[]>;
  getCurrentPrice(symbol: string, exchange?: string): Promise<number | null>;
  getPreviousPrice(symbol: string, exchange?: string): Promise<number | null>;
  isAvailable(): boolean;
}
