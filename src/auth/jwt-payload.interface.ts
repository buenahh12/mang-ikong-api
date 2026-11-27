import { UserRole } from '../users/entities/user.entity';

// What is stored inside the JWT token
export interface JwtPayload {
  sub: number; // user_id ("subject" of the token)
  email: string;
  role: UserRole;
}

// What the JWT strategy puts on request.user after checking the token
export interface AuthUser {
  userId: number;
  email: string;
  role: UserRole;
}
