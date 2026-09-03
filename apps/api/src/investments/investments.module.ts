import { Module } from '@nestjs/common';
import { InvestmentAccountsService } from './investment-accounts.service';
import { AssetsService } from './assets.service';
import { HoldingsService } from './holdings.service';
import { InvestmentTransactionsService } from './investment-transactions.service';
import { PortfolioService } from './portfolio.service';
import { WatchlistsService } from './watchlists.service';
import { MockMarketDataProvider } from './market-data/mock-market-data.provider';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';
import { GoalsModule } from '../goals/goals.module';
import { InvestmentAccountsController } from './investment-accounts.controller';
import { AssetsController } from './assets.controller';
import { HoldingsController } from './holdings.controller';
import { InvestmentTransactionsController } from './investment-transactions.controller';
import { PortfolioController } from './portfolio.controller';
import { WatchlistsController } from './watchlists.controller';

@Module({
  imports: [NotificationsModule, GoalsModule],
  controllers: [
    InvestmentAccountsController,
    AssetsController,
    HoldingsController,
    InvestmentTransactionsController,
    PortfolioController,
    WatchlistsController,
  ],
  providers: [
    InvestmentAccountsService,
    AssetsService,
    HoldingsService,
    InvestmentTransactionsService,
    PortfolioService,
    WatchlistsService,
    MockMarketDataProvider,
    PrismaService,
  ],
  exports: [
    InvestmentAccountsService,
    AssetsService,
    HoldingsService,
    InvestmentTransactionsService,
    PortfolioService,
    WatchlistsService,
    MockMarketDataProvider,
  ],
})
export class InvestmentsModule {}
