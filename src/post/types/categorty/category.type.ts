import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
  id!: string;
  @Field()
  name!: string;
  @Field({ nullable: true }) //as some categories may not have an image
  imageUrl!: string;

  @Field()
  postCount!: number;

  @Field()
  createdAt!: Date;
  @Field()
  updatedAt!: Date;
}
