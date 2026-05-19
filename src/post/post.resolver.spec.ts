import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostResolver } from './post.resolver';
import { PostService } from './post.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

describe('PostResolver', () => {
  let resolver: PostResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostResolver,
        PostService,
        { provide: getModelToken('Post'), useValue: {} },
        { provide: getModelToken('Category'), useValue: {} },
        { provide: UserService, useValue: { getUserById: jest.fn() } },
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
      ],
    }).compile();

    resolver = module.get<PostResolver>(PostResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
