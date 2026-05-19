import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserPayload } from '../common/types/current-user.type';
import { PostService } from './post.service';
import { Category } from './types/categorty/category.type';
import { CreateCategoryInput } from './types/categorty/create-category.input';
import { UpdateCategoryInput } from './types/categorty/update-category.input';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly postService: PostService) {}

  @Query(() => [Category])
  getCategories() {
    return this.postService.getCategories();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Mutation(() => Category)
  createCategory(
    @Args('input') input: CreateCategoryInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.postService.createCategory(input, user);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Mutation(() => Category)
  updateCategory(
    @Args('id') id: string,
    @Args('input') input: UpdateCategoryInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.postService.updateCategory(id, input, user);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Mutation(() => Boolean)
  async deleteCategory(
    @Args('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const res = await this.postService.deleteCategory(id, user);
    return !!res;
  }
}
