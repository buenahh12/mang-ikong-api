import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Put on a route to require a valid JWT. No/invalid/expired token → 401 Unauthorized.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
