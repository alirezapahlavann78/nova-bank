import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { WatchlistsService } from './watchlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments/watchlists')
@UseGuards(JwtAuthGuard)
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Get() async findAll(@Request() req: any, @Query() query: any) {
    return this.watchlistsService.findAll(req.user.id, query);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.watchlistsService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: any) {
    return this.watchlistsService.create(req.user.id, dto);
  }

  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.watchlistsService.update(id, req.user.id, dto);
  }

  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) {
    return this.watchlistsService.remove(id, req.user.id);
  }

  @Post(':id/assets') async addAsset(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.watchlistsService.addAsset(id, req.user.id, dto);
  }

  @Delete(':id/assets/:assetId') async removeAsset(@Request() req: any, @Param('id') id: string, @Param('assetId') assetId: string) {
    return this.watchlistsService.removeAsset(id, req.user.id, assetId);
  }
}
