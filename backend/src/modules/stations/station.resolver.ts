import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { StationsService } from './stations.service';
import { Station } from './models/station.model';
import { CreateStationInput, UpdateStationInput } from './inputs';

@Resolver(() => Station)
export class StationsResolver {
  constructor(private readonly stationsService: StationsService) {}

  @Query(() => [Station], { name: 'stations' })
  async findAll(
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    if (search) {
      return this.stationsService.search(search);
    }
    return this.stationsService.findAll();
  }

  @Query(() => Station, { name: 'station' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.stationsService.findOne(id);
  }

  @Mutation(() => Station)
  async createStation(@Args('input') createStationInput: CreateStationInput) {
    return this.stationsService.create(createStationInput);
  }

  @Mutation(() => Station)
  async updateStation(@Args('input') updateStationInput: UpdateStationInput) {
    const { id, ...updateData } = updateStationInput;
    return this.stationsService.update(id, updateData);
  }

  @Mutation(() => String)
  async deleteStation(@Args('id', { type: () => ID }) id: string) {
    const result = await this.stationsService.remove(id);
    return result.message;
  }
}
