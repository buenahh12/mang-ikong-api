import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../jwt-payload.interface';

// Usage: profile(@CurrentUser() user: AuthUser) → the logged-in user from the token
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
