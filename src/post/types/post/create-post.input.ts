import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsBoolean, IsArray, IsOptional, IsString, IsIn } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty()
  title!: string;

  @Field()
  @IsNotEmpty() 
  subtitle!: string;

  @Field()
  @IsNotEmpty()
  content!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: string[]; // category names

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @Field()
  @IsNotEmpty()
  authorEmail!: string;

  @Field()
  @IsNotEmpty()
  slug!: string;
}
