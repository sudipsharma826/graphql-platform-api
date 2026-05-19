import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsArray, IsOptional, IsString, IsIn } from 'class-validator';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true } )
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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  authorEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;
}
