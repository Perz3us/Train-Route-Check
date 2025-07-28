import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Station {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field()
  latitude: number;

  @Field()
  longitude: number;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
