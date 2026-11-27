import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';

// Usage: @Roles(UserRole.ADMIN) above a controller or route
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
