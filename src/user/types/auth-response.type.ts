import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.type';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken!: string;

  @Field(() => User)
  user!: User;
}
