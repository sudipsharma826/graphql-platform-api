import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument } from './schema/post.schema';
import { CreatePostInput } from './types/post/create-post.input';
import { CurrentUserPayload } from '../common/types/current-user.type';
import { PostQueryFilter } from './types/post/postQueryFilter.type';
import { CategoryDocument } from './schema/category.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Post')
    private postModel: Model<PostDocument>,
    @InjectModel('Category')
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async getPosts(filterInput: PostQueryFilter) {
    const filter: Record<string, unknown> = {};

    // search title and content
    if (filterInput.search) {
      filter.$or = [
        { title: { $regex: filterInput.search, $options: 'i' } },
        { content: { $regex: filterInput.search, $options: 'i' } },
      ];
    }

    // category filter
    if (filterInput.category) {
      filter.category = filterInput.category;
    }

    // isFeatured filter (only when true)
    if (filterInput.isFeatured === true) {
      filter.isFeatured = true;
    }

    const posts = await this.postModel.find(filter);

    // word limit
    if (filterInput.wordLimit) {
      return posts.map((post) => {
        const limitedContent = post.content
          ?.split(' ')
          .slice(0, filterInput.wordLimit)
          .join(' ');

        return {
          ...post.toObject(),
          content: limitedContent,
        };
      });
    }

    return posts;
  }

  // Get Post By Slug
  async getPostBySlug(slug: string) {
    const post = await this.postModel.findOne({ slug });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  //Create Post
  async createPost(input: CreatePostInput, user: CurrentUserPayload) {
    // Verify the input
    if (!input.title || !input.content || !input.authorEmail || !input.slug) {
      throw new BadRequestException('Invalid post input');
    }

    // Only admins can perform mutations
    if (!user?.isAdmin) {
      throw new UnauthorizedException('Admin required');
    }

    //Verify the user identity matches the post author
    if (!user.email || user.email !== input.authorEmail) {
      throw new UnauthorizedException('Invalid user');
    }

    // Normalize categories (names) and ensure categories exist
    const uniqueCategories: string[] = input.categories && input.categories.length
      ? [...new Set(input.categories.map((name) => name.trim()).filter(Boolean))]
      : [];

    // Ensure categories exist; create missing ones
    if (uniqueCategories.length > 0) {
      for (const name of uniqueCategories) {
        let cat = await this.categoryModel.findOne({ name });
        if (!cat) {
          cat = new this.categoryModel({ name });
          await cat.save();
        }
      }

      // Increment postCount for used categories
      await this.categoryModel.updateMany({ name: { $in: uniqueCategories } }, { $inc: { postCount: 1 } });
    }

    // Create the post with category names (as strings)
    const post = new this.postModel({
      ...input,
      categories: uniqueCategories,
    });

    return post.save();
  }

  // Category CRUD
  async createCategory(input: any, user: CurrentUserPayload) {
    if (!user?.isAdmin) throw new UnauthorizedException('Admin required');
    if (!input.name || !input.subtitle) throw new BadRequestException('Invalid category input');

    let cat = await this.categoryModel.findOne({ name: input.name });
    if (cat) return cat;

    cat = new this.categoryModel({ name: input.name, subtitle: input.subtitle, imageUrl: input.imageUrl || null });
    return cat.save();
  }

  async updateCategory(id: string, input: any, user: CurrentUserPayload) {
    if (!user?.isAdmin) throw new UnauthorizedException('Admin required');
    const cat = await this.categoryModel.findById(id);
    if (!cat) throw new NotFoundException('Category not found');

    const update: Record<string, unknown> = {};
    if (input.name !== undefined) update.name = input.name;
    if (input.subtitle !== undefined) update.subtitle = input.subtitle;
    if (input.imageUrl !== undefined) update.imageUrl = input.imageUrl;

    const updated = await this.categoryModel.findByIdAndUpdate(id, update, { new: true });
    return updated;
  }

  async deleteCategory(id: string, user: CurrentUserPayload) {
    if (!user?.isAdmin) throw new UnauthorizedException('Admin required');
    const cat = await this.categoryModel.findById(id);
    if (!cat) throw new NotFoundException('Category not found');

    const name = cat.name;

    // Remove category name from any posts
    await this.postModel.updateMany({ categories: name }, { $pull: { categories: name } });

    // Delete the category
    await this.categoryModel.findByIdAndDelete(id);

    return { success: true } as any;
  }

  // Update the Post (partial update: only provided fields)
  async updatePost(id: string, input: any, user: CurrentUserPayload) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (!user?.isAdmin) {
      throw new UnauthorizedException('Admin required');
    }

    // If trying to change authorEmail, keep it consistent with the authenticated admin author
    if (input.authorEmail && user.email && input.authorEmail !== user.email) {
      throw new UnauthorizedException('Cannot change author email to another user');
    }

    const updateData: Record<string, unknown> = {};

    // Copy only provided fields
    const updatableFields = [
      'title',
      'subtitle',
      'content',
      'isFeatured',
      'status',
      'image',
      'slug',
      'authorEmail',
    ];

    for (const field of updatableFields) {
      if (Object.prototype.hasOwnProperty.call(input, field) && input[field] !== undefined) {
        updateData[field] = input[field];
      }
    }

    // Handle categories specially: create missing categories and update counts
    if (Object.prototype.hasOwnProperty.call(input, 'categories') && input.categories !== undefined) {
      const provided: string[] = Array.isArray(input.categories) ? input.categories : [];
      const unique = [...new Set(provided.map((c) => c.trim()).filter(Boolean))];

      // Ensure categories exist
      for (const name of unique) {
        let cat = await this.categoryModel.findOne({ name });
        if (!cat) {
          cat = new this.categoryModel({ name });
          await cat.save();
        }
      }

      // Adjust postCount: decrement for removed, increment for added
      const before: string[] = Array.isArray(post.categories) ? post.categories : [];
      const toAdd = unique.filter((n) => !before.includes(n));
      const toRemove = before.filter((n) => !unique.includes(n));

      if (toAdd.length > 0) {
        await this.categoryModel.updateMany({ name: { $in: toAdd } }, { $inc: { postCount: 1 } });
      }
      if (toRemove.length > 0) {
        await this.categoryModel.updateMany({ name: { $in: toRemove } }, { $inc: { postCount: -1 } });
      }

      updateData['categories'] = unique;
    }

    const updated = await this.postModel.findByIdAndUpdate(id, updateData, { new: true });
    return updated;
  }
  
  // Delete the Post
  async deletePost(id: string, user: CurrentUserPayload) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (!user?.isAdmin) {
      throw new UnauthorizedException('Admin required');
    }

    // Decrement category postCounts
    const categories: string[] = Array.isArray(post.categories) ? post.categories : [];
    if (categories.length > 0) {
      await this.categoryModel.updateMany({ name: { $in: categories } }, { $inc: { postCount: -1 } });
    }

    await this.postModel.findByIdAndDelete(id);

    return { success: true } as any;
  }


  // Get Categories
  async getCategories() {
    return this.categoryModel.find();
  }

  // Get Categories for a specific post
  async getCategoriesForPost(post: PostDocument) {
    if (!post.categories || post.categories.length === 0) {
      return [];
    }

    // Query categories using the category names from the post
    const categories = await this.categoryModel.find({
      name: { $in: post.categories },
    });

    return categories;
  }

  private limitContent(content: string, wordLimit?: number) {
    if (!content) return '';
    if (wordLimit === undefined) return content;

    const words = content.split(' ');
    if (words.length <= wordLimit) return content;

    return words.slice(0, wordLimit).join(' ') + '...';
  }
}
