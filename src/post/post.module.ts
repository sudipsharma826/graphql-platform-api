import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { CategoryResolver } from './category.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { PostSchema } from './schema/post.schema';
import { CategorySchema } from './schema/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Category', schema: CategorySchema},
    ]),
    UserModule,
  ],
  providers: [PostResolver, CategoryResolver, PostService],
  exports: [PostService],
})
export class PostModule {}
