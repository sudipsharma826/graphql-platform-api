import { Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';
import { User } from './types/user.type';
import { SignupInput } from './types/signup.input';
import { LoginInput } from './types/login.input';
import { AuthResponse } from './types/auth-response.type';
import { AuthService } from './auth.service';
import { GraphQLContext } from '../common/types/graphQLContext.type';
import { ConfigService } from '@nestjs/config';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserPayload } from '../common/types/current-user.type';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Query(() => [User])
  getUser() {
    return this.userService.getUsers(); // register the userservice and user resolver the app.modules
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { nullable: true })
  async me(@CurrentUser() user: CurrentUserPayload) {
    if (!user?.email) {
      return null;
    }

    return this.userService.getUserByEmail(user.email);
  }

  @Mutation(() => AuthResponse)
  async signup(
    @Args('input') input: SignupInput,
    @Context() ctx: GraphQLContext,
  ) {
    const result = await this.authService.signup(input);
    this.attachAccessTokenCookie(ctx, result.accessToken);
    return result;
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: GraphQLContext,
  ) {
    const result = await this.authService.login(input);
    this.attachAccessTokenCookie(ctx, result.accessToken);
    return result;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async logout(
    @CurrentUser() user: CurrentUserPayload,
    @Context() ctx: GraphQLContext,
  ) {
    const result = await this.authService.logout(user.email);
    this.clearAccessTokenCookie(ctx);
    return result;
  }

  private attachAccessTokenCookie(ctx: GraphQLContext, token: string) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    const maxAge = 7 * 24 * 60 * 60 * 1000;

    if (ctx.res?.cookie) {
      ctx.res.cookie('accessToken', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge,
        path: '/',
      });
      return;
    }

    if (ctx.res?.setHeader) {
      const cookie = `accessToken=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=${isProd ? 'None' : 'Lax'}${isProd ? '; Secure' : ''}`;
      ctx.res.setHeader('Set-Cookie', cookie);
    }
  }

  private clearAccessTokenCookie(ctx: GraphQLContext) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    if (ctx.res?.cookie) {
      ctx.res.cookie('accessToken', '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 0,
        path: '/',
      });
      return;
    }

    if (ctx.res?.setHeader) {
      const cookie = `accessToken=; Path=/; HttpOnly; Max-Age=0; SameSite=${isProd ? 'None' : 'Lax'}${isProd ? '; Secure' : ''}`;
      ctx.res.setHeader('Set-Cookie', cookie);
    }
  }

}
