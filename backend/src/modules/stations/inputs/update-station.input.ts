import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateStationInput } from './create-station.input';

@InputType()
export class UpdateStationInput extends PartialType(CreateStationInput) {
  @Field(() => ID)
  id: string;
}
