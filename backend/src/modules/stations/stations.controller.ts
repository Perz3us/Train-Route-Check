import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { StationsService } from './stations.service';
import { CreateStationDto, UpdateStationDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stations')
@UseGuards(JwtAuthGuard)
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    if (search) {
      return this.stationsService.search(search);
    }
    return this.stationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStationDto: UpdateStationDto,
  ) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.stationsService.remove(id);
  }
}
