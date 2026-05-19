import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';
import { CurrentUserPayload } from '../types/current-user.type';
import { GraphQLContext } from '../types/graphQLContext.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GraphQLContext>();

    const req = gqlContext.req;
    const authHeader = req.headers.authorization;

    let token = req.cookies?.accessToken; // get token set while the login or signup, if exist
    console.log('AuthGuard - Token from cookies:', token);
    if (!token && authHeader) {
      const [scheme, bearerToken] = authHeader.split(' ');
      if (scheme?.toLowerCase() === 'bearer' && bearerToken) {
        token = bearerToken;
      }
    }

    if (!token) return false;

    const secretKey = this.configService.get<string>('SECRET_KEY');
    if (!secretKey) return false;

    try {
      const decoded = jwt.verify(token, secretKey) as CurrentUserPayload;
      req.user = decoded;
      return true;
    } catch {
      return false;
    }
  }
}
