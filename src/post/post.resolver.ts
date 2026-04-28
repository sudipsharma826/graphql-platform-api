import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PostService } from './post.service';
import { Query } from '@nestjs/graphql';
import { Post } from './types/post.type';
import { User } from 'src/user/types/user.type';
import { UserService } from 'src/user/user.service';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [Post])
  async getPosts() {
    return this.postService.getPosts();
  }

  //Get the user details from the post
  @ResolveField(() => User, { nullable: true })
  async user(@Parent() post: Post) {
    const authorEmail = (post as Post & { authorEmail?: string }).authorEmail;

    if (!authorEmail) {
      return null;
    }

    return this.userService.getUserByEmail(authorEmail);
  }
}
