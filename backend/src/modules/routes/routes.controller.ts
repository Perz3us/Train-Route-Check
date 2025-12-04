import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  ParseBoolPipe,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto, UpdateRouteDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body(ValidationPipe) createRouteDto: CreateRouteDto) {
    return await this.routesService.create(createRouteDto);
  }

  @Get()
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('includeStations', new DefaultValuePipe(true), ParseBoolPipe)
    includeStations?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const isActiveBool =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return await this.routesService.findAll({
      isActive: isActiveBool,
      includeStations,
      page,
      limit,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return await this.routesService.getRouteStats();
  }

  @Get('train/:trainNumber')
  async findByTrainNumber(@Param('trainNumber') trainNumber: string) {
    return await this.routesService.findByTrainNumber(trainNumber);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.routesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRouteDto: UpdateRouteDto,
  ) {
    return await this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.routesService.remove(id);
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.routesService.hardDelete(id);
  }
}
