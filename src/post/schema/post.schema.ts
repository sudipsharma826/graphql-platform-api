import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type PostDocument = Post & Document;
@Schema({ timestamps: true })
export class Post {

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  authorEmail!: string;

  @Prop({ required: true })
  title!: string;
  @Prop({ required: true })
  subtitle!: string;
  @Prop({ required: true })
  content!: string;
  @Prop({ type: [String], required: true })
  categories!: string[];
  @Prop({ required: true })
  slug!: string;
  @Prop()
  image!: string;
  @Prop({ default: 0 })
  views!: number;
  @Prop({ type: [String], default: [] })
  likedByUsers!: string[];
  @Prop({ type: [String], default: [] })
  commentedByUsers!: string[];
  @Prop({ type: [String], default: [] })
  lovedByUsers!: string[];
  @Prop({ type: [String], default: [] })
  savedByUsers!: string[];
  @Prop({ default: false })
  isFeatured!: boolean;
  @Prop({ enum: ['draft', 'published'], default: 'published' })
  status!: 'draft' | 'published';
}
export const PostSchema = SchemaFactory.createForClass(Post);
