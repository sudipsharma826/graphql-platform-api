import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  username!: string;
  @Field()
  email!: string;
  @Field()
  photoURL!: string;
  @Field()
  isAdmin!: boolean;
  @Field({ description: 'Indicates if the user is currently signed in' })
  isSigned!: boolean;
  @Field()
  lastLogin!: Date;
  @Field(() => [String])
  likedPosts!: string[];
  @Field(() => [String])
  lovedPosts!: string[];
  @Field(() => [String])
  savedPosts!: string[];
  @Field(() => [String])
  commentPosts!: string[];
}
