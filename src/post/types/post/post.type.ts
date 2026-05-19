import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../../user/types/user.type';
import { Category } from '../categorty/category.type';
import { Schema } from '@nestjs/mongoose';

@ObjectType()
export class Post {
  id!: string;

  @Field(() => User, { description: 'Author of the post', nullable: true })
  user!: User;

  @Field()
  title!: string;

  @Field()
  subtitle!: string;

  @Field()
  content!: string;

  @Field(() => [Category], { description: 'Categories of the post' })
  categories!: Category[];
  @Field()
  slug!: string;
  @Field()
  image!: string;
  @Field()
  views!: number;
  @Field(() => [String])
  likedByUsers!: string[];
  @Field(() => [String])
  commentedByUsers!: string[];
  @Field(() => [String])
  lovedByUsers!: string[];
  @Field(() => [String])
  savedByUsers!: string[];
  @Field()
  isFeatured!: boolean;
  @Field()
  status!: string;

  @Field()
  createdAt!: Date;
  @Field()
  updatedAt!: Date;
}
