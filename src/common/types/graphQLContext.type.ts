import { CurrentUserPayload } from './current-user.type';

export interface GraphQLContext {
  req: {
    headers: {
      authorization?: string;
      cookie?: string;
    };
    cookies?: Record<string, string>;
    user?: CurrentUserPayload;
  };
  res?: {
    cookie?: (
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'lax' | 'strict' | 'none';
        maxAge?: number;
        path?: string;
      },
    ) => void;
    setHeader?: (name: string, value: string | string[]) => void;
  };
}
