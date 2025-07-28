import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, Length } from 'class-validator';

@InputType()
export class CreateStationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  code: string;

  @Field()
  @IsNumber()
  latitude: number;

  @Field()
  @IsNumber()
  longitude: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  state: string;
}
