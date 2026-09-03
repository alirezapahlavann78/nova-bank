import { Injectable, Logger } from '@nestjs/common';
import { MarketDataProvider } from './market-data-provider.interface';
import { AssetDetail, AssetType } from '@nova-bank/types';

const MOCK_ASSETS: Record<string, Partial<AssetDetail & { price: number; previousPrice: number }>> = {
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'STOCK' as AssetType, exchange: 'NASDAQ', currency: 'USD', currentPrice: 192.5, previousPrice: 190.3 },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corporation', assetType: 'STOCK' as AssetType, exchange: 'NASDAQ', currency: 'USD', currentPrice: 375.2, previousPrice: 372.1 },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', assetType: 'STOCK' as AssetType, exchange: 'NASDAQ', currency: 'USD', currentPrice: 185.7, previousPrice: 183.4 },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', assetType: 'STOCK' as AssetType, exchange: 'NASDAQ', currency: 'USD', currentPrice: 245.8, previousPrice: 250.1 },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', assetType: 'STOCK' as AssetType, exchange: 'NASDAQ', currency: 'USD', currentPrice: 145.6, previousPrice: 144.2 },
  SPY: { symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetType: 'ETF' as AssetType, exchange: 'NYSE', currency: 'USD', currentPrice: 475.3, previousPrice: 472.0 },
  VTI: { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetType: 'ETF' as AssetType, exchange: 'NYSE', currency: 'USD', currentPrice: 245.1, previousPrice: 243.5 },
  BND: { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetType: 'BOND' as AssetType, exchange: 'NYSE', currency: 'USD', currentPrice: 78.2, previousPrice: 78.0 },
  BTC: { symbol: 'BTC', name: 'Bitcoin', assetType: 'CRYPTO' as AssetType, exchange: 'CRYPTO', currency: 'USD', currentPrice: 62500.0, previousPrice: 61800.0 },
  ETH: { symbol: 'ETH', name: 'Ethereum', assetType: 'CRYPTO' as AssetType, exchange: 'CRYPTO', currency: 'USD', currentPrice: 3200.0, previousPrice: 3150.0 },
  IRT_CASH: { symbol: 'CASH', name: 'Cash', assetType: 'CASH' as AssetType, exchange: undefined, currency: 'IRT', currentPrice: 1, previousPrice: 1 },
};

@Injectable()
export class MockMarketDataProvider implements MarketDataProvider {
  private readonly logger = new Logger(MockMarketDataProvider.name);

  isAvailable(): boolean {
    return true;
  }

  async getAsset(symbol: string, exchange?: string): Promise<AssetDetail | null> {
    const key = exchange ? `${symbol}:${exchange}` : symbol;
    const asset = MOCK_ASSETS[symbol] || MOCK_ASSETS[key];
    if (!asset) return null;

    return {
      id: `${symbol}`,
      symbol: asset.symbol!,
      name: asset.name!,
      assetType: asset.assetType!,
      exchange: asset.exchange ?? undefined,
      currency: asset.currency!,
      isin: `MOCK${symbol}ISIN`,
      isActive: true,
      currentPrice: asset.currentPrice,
      previousPrice: asset.previousPrice,
      priceTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getAssets(symbols: string[]): Promise<AssetDetail[]> {
    const results: AssetDetail[] = [];
    for (const symbol of symbols) {
      const asset = await this.getAsset(symbol);
      if (asset) results.push(asset);
    }
    return results;
  }

  async getCurrentPrice(symbol: string, exchange?: string): Promise<number | null> {
    const asset = await this.getAsset(symbol, exchange);
    return asset?.currentPrice ?? null;
  }

  async getPreviousPrice(symbol: string, exchange?: string): Promise<number | null> {
    const asset = await this.getAsset(symbol, exchange);
    return asset?.previousPrice ?? null;
  }
}
